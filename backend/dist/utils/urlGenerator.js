"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSubdomain = exports.isValidCustomDomain = exports.generateQRPreviewUrl = exports.isCustomSubdomainRequest = exports.extractSubdomain = exports.generateSubdomainQRUrl = exports.generateCustomQRUrl = exports.generateQRUrl = void 0;
const generateQRUrl = (shortCode, user, lockedSubdomain) => {
    if (lockedSubdomain) {
        return `https://${lockedSubdomain}.netqr.io/${shortCode}`;
    }
    if (user && user.customDomainEnabled && user.approvedCustomDomain) {
        return `https://${user.approvedCustomDomain}/${shortCode}`;
    }
    if (user && user.subdomain) {
        return `https://${user.subdomain}.netqr.io/${shortCode}`;
    }
    return `https://netqr.io/${shortCode}`;
};
exports.generateQRUrl = generateQRUrl;
const generateCustomQRUrl = (shortCode, customDomain) => {
    return `https://${customDomain}/${shortCode}`;
};
exports.generateCustomQRUrl = generateCustomQRUrl;
const generateSubdomainQRUrl = (shortCode, subdomain) => {
    return `https://${subdomain}.netqr.io/${shortCode}`;
};
exports.generateSubdomainQRUrl = generateSubdomainQRUrl;
const extractSubdomain = (hostname) => {
    const mainDomain = 'netqr.io';
    if (hostname.endsWith(`.${mainDomain}`)) {
        const subdomain = hostname.replace(`.${mainDomain}`, '');
        if (subdomain && subdomain !== 'www' && subdomain !== 'netqr') {
            return subdomain;
        }
    }
    return null;
};
exports.extractSubdomain = extractSubdomain;
const isCustomSubdomainRequest = (hostname) => {
    const subdomain = (0, exports.extractSubdomain)(hostname);
    return subdomain !== null;
};
exports.isCustomSubdomainRequest = isCustomSubdomainRequest;
const generateQRPreviewUrl = (shortCode, user, lockedSubdomain) => {
    const baseUrl = (0, exports.generateQRUrl)(shortCode, user, lockedSubdomain);
    return `${baseUrl}?preview=true`;
};
exports.generateQRPreviewUrl = generateQRPreviewUrl;
const isValidCustomDomain = (domain) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
};
exports.isValidCustomDomain = isValidCustomDomain;
const isValidSubdomain = (subdomain) => {
    const subdomainRegex = /^user-[a-z0-9]{10}$/;
    return subdomainRegex.test(subdomain);
};
exports.isValidSubdomain = isValidSubdomain;
//# sourceMappingURL=urlGenerator.js.map