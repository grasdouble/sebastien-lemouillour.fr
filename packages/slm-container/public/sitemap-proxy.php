<?php
$route = $_GET['parcel'] ?? null;

if (!$route || !preg_match('/^[a-z-]+$/', $route)) {
    http_response_code(400);
    exit;
}

$importmapUrl = 'https://cdn.sebastien-lemouillour.fr/importMap.json';

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
    $importmapRaw = @file_get_contents($importmapUrl);
    if ($importmapRaw === false) {
        http_response_code(502);
        exit;
    }
}

$importmap = json_decode($importmapRaw, true);
$parcelKey = "@grasdouble/slm_parcel_$route";
$parcelUrl = $importmap['imports'][$parcelKey] ?? null;

if (!$parcelUrl) {
    http_response_code(404);
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
    $xml = @file_get_contents($sitemapUrl);
    if ($xml === false) {
        http_response_code(502);
        exit;
    }
}

header('Content-Type: application/xml; charset=UTF-8');
header('Cache-Control: public, max-age=3600');
echo $xml;
