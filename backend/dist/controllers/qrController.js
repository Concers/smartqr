"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRController = void 0;
const qrService_1 = require("@/services/qrService");
const analyticsService_1 = require("@/services/analyticsService");
const database_1 = __importDefault(require("@/config/database"));
const cacheService_1 = require("@/services/cacheService");
const app_1 = require("@/config/app");
class QRController {
    static async createQRCode(req, res) {
        try {
            const userId = req.user?.id;
            const qrCode = await qrService_1.QRService.createQRCode(req.body, userId);
            res.status(201).json({
                success: true,
                data: qrCode,
                message: 'QR code created successfully',
            });
        }
        catch (error) {
            console.error('Create QR code error:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to create QR code',
            });
        }
    }
    static async resolveShortCode(req, res) {
        try {
            const { shortCode } = req.params;
            const result = await qrService_1.QRService.resolveShortCode(shortCode);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error('Resolve short code error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to resolve short code',
            });
        }
    }
    static async getQRCodes(req, res) {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const result = await qrService_1.QRService.getQRCodesByUser(userId, page, limit, search);
            res.json({
                success: true,
                data: {
                    data: result.qrCodes,
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        }
        catch (error) {
            console.error('Get QR codes error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get QR codes',
            });
        }
    }
    static async getQRCodeById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const qrCode = await qrService_1.QRService.getQRCodeById(id, userId);
            if (!qrCode) {
                res.status(404).json({
                    success: false,
                    error: 'QR code not found',
                });
                return;
            }
            res.json({
                success: true,
                data: qrCode,
            });
        }
        catch (error) {
            console.error('Get QR code error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get QR code',
            });
        }
    }
    static async updateDestination(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            console.log('Update Destination Request Logic:', {
                id,
                body: req.body,
                userId
            });
            await qrService_1.QRService.updateDestination(id, req.body, userId);
            res.json({
                success: true,
                message: 'Destination updated successfully',
            });
        }
        catch (error) {
            console.error('Update destination error:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to update destination',
            });
        }
    }
    static async deleteQRCode(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            await qrService_1.QRService.deleteQRCode(id, userId);
            res.json({
                success: true,
                message: 'QR code deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete QR code error:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to delete QR code',
            });
        }
    }
    static async toggleQRCodeStatus(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const isActive = await qrService_1.QRService.toggleQRCodeStatus(id, userId);
            res.json({
                success: true,
                data: { isActive },
                message: `QR code ${isActive ? 'activated' : 'deactivated'} successfully`,
            });
        }
        catch (error) {
            console.error('Toggle QR code status error:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to toggle QR code status',
            });
        }
    }
    static async redirectQRCode(req, res) {
        try {
            const { shortCode } = req.params;
            const host = (req.hostname || '').toLowerCase();
            const root = (app_1.config.qr.rootDomain || '').toLowerCase();
            const isSubdomainRequest = !!(host && root && host !== root && host.endsWith(`.${root}`));
            let destinationUrl = null;
            const canUseCache = !isSubdomainRequest;
            if (canUseCache) {
                destinationUrl = await cacheService_1.CacheService.getCachedDestination(shortCode);
            }
            if (!destinationUrl) {
                destinationUrl = await qrService_1.QRService.getDestinationByShortCode(shortCode, host);
                if (destinationUrl) {
                    if (canUseCache) {
                        await cacheService_1.CacheService.cacheDestination(shortCode, destinationUrl);
                    }
                }
            }
            if (!destinationUrl) {
                res.status(404).json({
                    success: false,
                    error: 'QR code not found or inactive',
                });
                return;
            }
            const qrCode = await database_1.default.qrCode.findUnique({
                where: { shortCode },
                select: { id: true },
            });
            if (qrCode) {
                await analyticsService_1.AnalyticsService.trackClick(qrCode.id, req);
            }
            if (typeof destinationUrl === 'string' && destinationUrl.toLowerCase().startsWith('data:text/vcard')) {
                try {
                    const commaIndex = destinationUrl.indexOf(',');
                    const meta = commaIndex >= 0 ? destinationUrl.slice(0, commaIndex) : destinationUrl;
                    const dataPart = commaIndex >= 0 ? destinationUrl.slice(commaIndex + 1) : '';
                    const isBase64 = /;base64/i.test(meta);
                    const vcardText = isBase64
                        ? Buffer.from(dataPart, 'base64').toString('utf8')
                        : decodeURIComponent(dataPart);
                    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
                    res.setHeader('Content-Disposition', 'attachment; filename="contact.vcf"');
                    res.status(200).send(vcardText);
                    return;
                }
                catch (e) {
                    console.error('Failed to serve vCard attachment:', e);
                }
            }
            if (typeof destinationUrl === 'string' && destinationUrl.toLowerCase().startsWith('data:text/html')) {
                try {
                    const commaIndex = destinationUrl.indexOf(',');
                    const meta = commaIndex >= 0 ? destinationUrl.slice(0, commaIndex) : destinationUrl;
                    const dataPart = commaIndex >= 0 ? destinationUrl.slice(commaIndex + 1) : '';
                    const isBase64 = /;base64/i.test(meta);
                    let htmlText = isBase64
                        ? Buffer.from(dataPart, 'base64').toString('utf8')
                        : decodeURIComponent(dataPart);
                    const rehbereButtonRe = /<button\s+onclick="[^"]*"[^>]*>([\s\S]*?Rehbere Ekle[\s\S]*?)<\/button>/i;
                    if (rehbereButtonRe.test(htmlText)) {
                        const fields = {};
                        const nmMatch = htmlText.match(/class="nm"[^>]*>([^<]+)/);
                        const ttMatch = htmlText.match(/class="tt"[^>]*>([^<]+)/);
                        const coMatch = htmlText.match(/class="co"[^>]*>([^<]+)/);
                        const telMatch = htmlText.match(/href="tel:([^"]+)"/);
                        const mailMatch = htmlText.match(/href="mailto:([^"]+)"/);
                        const addrRvMatches = [...htmlText.matchAll(/class="rv"[^>]*>([^<]+)/g)];
                        const konumIdx = htmlText.indexOf('Konum');
                        if (konumIdx > -1) {
                            const afterKonum = htmlText.slice(konumIdx);
                            const addrM = afterKonum.match(/class="rv"[^>]*>([^<]+)/);
                            if (addrM?.[1])
                                fields['address'] = addrM[1].trim();
                        }
                        const linkMatches = [...htmlText.matchAll(/href="https?:\/\/([^"]+)"/g)];
                        for (const lm of linkMatches) {
                            const url = lm[1];
                            if (url.includes('linkedin.com'))
                                fields['linkedin'] = url;
                            else if (url.includes('maps.google'))
                                continue;
                            else if (url.includes('netqr.io'))
                                continue;
                            else if (!fields['website'])
                                fields['website'] = url;
                        }
                        if (nmMatch?.[1])
                            fields['name'] = nmMatch[1].trim();
                        if (ttMatch?.[1])
                            fields['title'] = ttMatch[1].trim();
                        if (coMatch?.[1])
                            fields['company'] = coMatch[1].trim();
                        if (telMatch?.[1])
                            fields['phone'] = telMatch[1].trim();
                        if (mailMatch?.[1])
                            fields['email'] = mailMatch[1].trim();
                        const params = new URLSearchParams();
                        for (const [k, v] of Object.entries(fields)) {
                            if (v)
                                params.set(k, v);
                        }
                        const vcardUrl = `https://netqr.io/api/vcard?${params.toString()}`;
                        const aStyle = 'display:flex;width:100%;padding:12px;border:none;border-radius:12px;background:linear-gradient(to right,#2563eb,#4f46e5);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 25px -8px rgba(99,102,241,.5);text-decoration:none';
                        htmlText = htmlText.replace(rehbereButtonRe, `<a href="${vcardUrl}" style="${aStyle}">$1</a>`);
                        htmlText = htmlText.replace(/<script>\s*function\s+downloadVCard[\s\S]*?<\/script>/i, '');
                    }
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.status(200).send(htmlText);
                    return;
                }
                catch (e) {
                    console.error('Failed to serve HTML data URI:', e);
                }
            }
            const buildVideoEmbedUrl = (rawUrl) => {
                try {
                    const u = new URL(rawUrl);
                    const host = u.hostname.toLowerCase();
                    if (host === 'youtu.be') {
                        const id = u.pathname.replace('/', '').trim();
                        if (!id)
                            return null;
                        return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
                    }
                    if (host.endsWith('youtube.com')) {
                        const id = u.searchParams.get('v') || '';
                        if (!id)
                            return null;
                        return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
                    }
                    if (host === 'vimeo.com') {
                        const id = u.pathname.split('/').filter(Boolean)[0] || '';
                        if (!id)
                            return null;
                        return `https://player.vimeo.com/video/${encodeURIComponent(id)}`;
                    }
                    if (host.endsWith('player.vimeo.com')) {
                        const parts = u.pathname.split('/').filter(Boolean);
                        const idx = parts.indexOf('video');
                        const id = idx >= 0 ? parts[idx + 1] : parts[0];
                        if (!id)
                            return null;
                        return `https://player.vimeo.com/video/${encodeURIComponent(id)}`;
                    }
                    return null;
                }
                catch {
                    return null;
                }
            };
            const embedUrl = typeof destinationUrl === 'string' ? buildVideoEmbedUrl(destinationUrl) : null;
            if (embedUrl) {
                const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Video</title>
  <style>
    body{margin:0;background:#0b1220;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .wrap{width:min(960px,100%);padding:16px}
    .box{position:relative;width:100%;padding-top:56.25%;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35);background:#000}
    iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
    .meta{margin-top:12px;font-size:12px;opacity:.85;word-break:break-all}
    a{color:#93c5fd}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="box">
      <iframe
        src="${embedUrl}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
    <div class="meta">Kaynak: <a href="${destinationUrl}">${destinationUrl}</a></div>
  </div>
</body>
</html>`;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.status(200).send(html);
                return;
            }
            if (typeof destinationUrl === 'string' && destinationUrl.toUpperCase().startsWith('WIFI:')) {
                const wifiPayload = destinationUrl;
                const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WiFi</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0f172a;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{width:100%;max-width:520px;background:#ffffff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.25);overflow:hidden}
    .hdr{padding:18px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff}
    .ttl{margin:0;font-size:18px;font-weight:800}
    .sub{margin:6px 0 0;font-size:12px;opacity:.85}
    .body{padding:16px 18px 18px}
    .lbl{font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
    .val{margin-top:6px;font-size:14px;color:#0f172a;word-break:break-all;border:1px solid #e2e8f0;border-radius:12px;padding:12px;background:#f8fafc}
    .btns{display:grid;gap:10px;margin-top:14px}
    button,a{appearance:none;border:0;border-radius:12px;padding:12px 14px;font-weight:800;background:#0f172a;color:#fff;text-decoration:none;text-align:center}
    a{background:#334155}
    button:active,a:active{transform:scale(.99)}
    .hint{margin-top:10px;font-size:12px;color:#475569}
  </style>
</head>
<body>
  <div class="card">
    <div class="hdr">
      <h1 class="ttl">WiFi</h1>
      <div class="sub">Ağa katılmayı deniyoruz...</div>
    </div>
    <div class="body">
      <div class="lbl">Payload</div>
      <div class="val" id="payload">${wifiPayload}</div>
      <div class="btns">
        <a id="open" href="${wifiPayload}">Ağa Katıl</a>
        <button id="copy">Kopyala</button>
      </div>
      <div class="hint">Bazı cihazlarda otomatik açılmazsa “Ağa Katıl” butonuna basın.</div>
    </div>
  </div>
  <script>
    (function(){
      var payload = ${JSON.stringify(wifiPayload)};
      try { window.location.href = payload; } catch (e) {}

      var btn=document.getElementById('copy');
      btn.addEventListener('click', function(){
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(payload);
          btn.innerText='Kopyalandı';
          setTimeout(function(){btn.innerText='Kopyala';}, 1200);
        }
      });
    })();
  </script>
</body>
</html>`;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.status(200).send(html);
                return;
            }
            res.redirect(302, destinationUrl);
        }
        catch (error) {
            console.error('Redirect QR code error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to redirect',
            });
        }
    }
    static async getQRCodeAnalytics(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const query = req.query;
            const qrCode = await qrService_1.QRService.getQRCodeById(id, userId);
            if (!qrCode) {
                res.status(404).json({
                    success: false,
                    error: 'QR code not found',
                });
                return;
            }
            const analytics = await analyticsService_1.AnalyticsService.getAnalytics(id, query);
            res.json({
                success: true,
                data: analytics,
            });
        }
        catch (error) {
            console.error('Get QR code analytics error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get analytics',
            });
        }
    }
}
exports.QRController = QRController;
//# sourceMappingURL=qrController.js.map