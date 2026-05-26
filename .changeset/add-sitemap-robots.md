---
'@grasdouble/slm-container': patch
'@grasdouble/slm_parcel_learn': patch
---

feat: add sitemap and robots.txt — learn parcel generates dist/sitemap.xml (all learn routes) deployed to CDN; Apache mod_proxy proxies /learn?sitemap to the CDN so the container never needs rebuilding when parcel content changes; container generates sitemap-core.xml (static routes), sitemap.xml (index), robots.txt, and .htaccess with the proxy rule.
