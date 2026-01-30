import { User } from '@prisma/client';

/**
 * Generate QR URL based on user's custom domain settings
 */
export const generateQRUrl = (shortCode: string, user: User | null): string => {
  if (user && user.customDomainEnabled && user.approvedCustomDomain) {
    return `https://${user.approvedCustomDomain}/${shortCode}`;
  }
  
  if (user && user.subdomain) {
    return `https://${user.subdomain}.netqr.io/${shortCode}`;
  }
  
  return `https://netqr.io/${shortCode}`;
};

/**
 * Generate custom QR URL for approved custom domains
 */
export const generateCustomQRUrl = (shortCode: string, customDomain: string): string => {
  return `https://${customDomain}/${shortCode}`;
};

/**
 * Generate subdomain QR URL
 */
export const generateSubdomainQRUrl = (shortCode: string, subdomain: string): string => {
  return `https://${subdomain}.netqr.io/${shortCode}`;
};

/**
 * Extract subdomain from hostname
 */
export const extractSubdomain = (hostname: string): string | null => {
  const mainDomain = 'netqr.io';
  
  if (hostname.endsWith(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');
    
    // Exclude www and main domain
    if (subdomain && subdomain !== 'www' && subdomain !== 'netqr') {
      return subdomain;
    }
  }
  
  return null;
};

/**
 * Check if request is for a custom subdomain
 */
export const isCustomSubdomainRequest = (hostname: string): boolean => {
  const subdomain = extractSubdomain(hostname);
  return subdomain !== null;
};

/**
 * Generate QR preview URL (for frontend display)
 */
export const generateQRPreviewUrl = (shortCode: string, user: User | null): string => {
  const baseUrl = generateQRUrl(shortCode, user);
  return `${baseUrl}?preview=true`;
};

/**
 * Validate custom domain format
 */
export const isValidCustomDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
};

/**
 * Validate subdomain format
 */
export const isValidSubdomain = (subdomain: string): boolean => {
  const subdomainRegex = /^user-[a-z0-9]{10}$/;
  return subdomainRegex.test(subdomain);
};
