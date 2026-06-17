<?php
/**
 * Sitemap proxy — serves /<parcel>/sitemap.xml as valid XML for crawlers.
 * Requires PHP 7.4+ (arrow functions). curl is optional; falls back to file_get_contents.
 *
 * Flow:
 *   1. Resolve the parcel bundle URL from importMap.json on the CDN.
 *   2. Try fetching sitemap-publishedAt-filter.json (dynamic mode):
 *        - Filter entries where publishedAt > today (unpublished content).
 *        - Build and return XML on the fly.
 *   3. Fallback: fetch and proxy the static sitemap.xml (static mode).
 *
 * Parcels opt into dynamic mode by publishing sitemap-publishedAt-filter.json alongside
 * their bundle (use sitemapPublishedAtFilterPlugin from @grasdouble/slm_plugin_vite_sitemap-generator).
 * Parcels without a manifest are served their static sitemap.xml unchanged.
 */
$route = $_GET['parcel'] ?? null;

if (!$route || !preg_match('/^[a-z-]+$/', $route)) {
    http_response_code(400);
    exit;
}

$importmapUrl = 'https://cdn.sebastien-lemouillour.fr/importMap.json';
$allowedCdnHost = 'cdn.sebastien-lemouillour.fr';

if (function_exists('curl_init')) {
    $ch = curl_init($importmapUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $importmapRaw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($importmapRaw === false || $httpCode !== 200) {
        http_response_code(502);
        exit;
    }
} else {
    $ctx = stream_context_create(['http' => ['timeout' => 10]]);
    $importmapRaw = @file_get_contents($importmapUrl, false, $ctx);
    if ($importmapRaw === false) {
        http_response_code(502);
        exit;
    }
}

$importmap = json_decode($importmapRaw, true);
if (!is_array($importmap) || !isset($importmap['imports']) || !is_array($importmap['imports'])) {
    http_response_code(502);
    exit;
}

$parcelKey = "@grasdouble/slm_parcel_$route";
$parcelUrl = $importmap['imports'][$parcelKey] ?? null;

if (!$parcelUrl) {
    http_response_code(404);
    exit;
}

// Allowlist: only fetch from the known CDN host to prevent SSRF.
$parsed = parse_url($parcelUrl);
if (!$parsed || ($parsed['scheme'] ?? '') !== 'https' || ($parsed['host'] ?? '') !== $allowedCdnHost) {
    http_response_code(403);
    exit;
}

$parcelBase = rtrim($parcelUrl, '/');

/**
 * Fetches a URL via cURL or file_get_contents and returns [body, httpCode].
 * Returns [false, 0] on network error.
 */
function fetchRemote(string $url): array {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [$body, $code];
    }
    $ctx = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
    $body = @file_get_contents($url, false, $ctx);
    if ($body === false) {
        return [false, 0];
    }
    // Parse the actual HTTP status from $http_response_header (populated by file_get_contents).
    $code = 0;
    if (!empty($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $header, $m)) {
                $code = (int) $m[1];
            }
        }
    }
    return [$body, $code];
}

// --- Try dynamic sitemap from manifest (publishedAt-aware) ---
[$manifestRaw, $manifestCode] = fetchRemote("$parcelBase/sitemap-publishedAt-filter.json");

if ($manifestRaw !== false && $manifestCode === 200) {
    $manifest = json_decode($manifestRaw, true);

    if (is_array($manifest) && isset($manifest['urls']) && is_array($manifest['urls'])) {
        $baseUrl = is_string($manifest['baseUrl'] ?? null) ? $manifest['baseUrl'] : '';
        $today = date('Y-m-d');

        $xmlEscape = fn(string $s): string => htmlspecialchars($s, ENT_XML1 | ENT_QUOTES, 'UTF-8');

        $entries = [];
        foreach ($manifest['urls'] as $entry) {
            if (!is_array($entry) || !isset($entry['loc'])) continue;

            // Filter by publishedAt when present: only include if publishedAt <= today.
            if (isset($entry['publishedAt']) && is_string($entry['publishedAt']) && $entry['publishedAt'] > $today) {
                continue;
            }

            $loc = $entry['loc'];
            if ($baseUrl !== '' && $loc[0] === '/') {
                $loc = $baseUrl . $loc;
            }

            $lastmod    = $xmlEscape((string) ($entry['lastmod']    ?? $today));
            $changefreq = $xmlEscape((string) ($entry['changefreq'] ?? 'monthly'));
            $priority   = $xmlEscape((string) ($entry['priority']   ?? '0.5'));
            $locEscaped = $xmlEscape((string) $loc);

            $entries[] = "  <url>\n    <loc>$locEscaped</loc>\n    <lastmod>$lastmod</lastmod>\n    <changefreq>$changefreq</changefreq>\n    <priority>$priority</priority>\n  </url>";
        }

        $urlset = implode("\n", $entries);
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n$urlset\n</urlset>\n";

        header('Content-Type: application/xml; charset=UTF-8');
        header('Cache-Control: public, max-age=3600');
        echo $xml;
        exit;
    }

    // Manifest was present (HTTP 200) but structurally invalid (e.g. stale CDN cache).
    // The static sitemap.xml no longer exists for manifest-based parcels, so return an
    // empty but valid sitemap rather than falling through to a guaranteed 502.
    $emptyXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n</urlset>\n";
    header('Content-Type: application/xml; charset=UTF-8');
    header('Cache-Control: public, max-age=300');
    echo $emptyXml;
    exit;
}

// --- Fallback: serve static sitemap.xml ---
[$xml, $httpCode] = fetchRemote("$parcelBase/sitemap.xml");

if ($xml === false || $httpCode !== 200) {
    http_response_code(502);
    exit;
}

header('Content-Type: application/xml; charset=UTF-8');
header('Cache-Control: public, max-age=3600');
echo $xml;
