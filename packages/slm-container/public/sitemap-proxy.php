<?php
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

$sitemapUrl = rtrim($parcelUrl, '/') . '/sitemap.xml';

if (function_exists('curl_init')) {
    $ch = curl_init($sitemapUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $xml = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($xml === false || $httpCode !== 200) {
        http_response_code(502);
        exit;
    }
} else {
    $ctx = stream_context_create(['http' => ['timeout' => 10]]);
    $xml = @file_get_contents($sitemapUrl, false, $ctx);
    if ($xml === false) {
        http_response_code(502);
        exit;
    }
}

header('Content-Type: application/xml; charset=UTF-8');
header('Cache-Control: public, max-age=3600');
echo $xml;
