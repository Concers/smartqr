import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/app';

export const validateDomain = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const host = (req.hostname || '').toLowerCase();

    // Always allow localhost during development
    if (config.nodeEnv === 'development' && (host === 'localhost' || host.startsWith('localhost:'))) {
      next();
      return;
    }

    const allowed: string[] = [];

    // Primary QR domain
    if (config.qr.baseUrl) {
      try {
        const baseHost = new URL(config.qr.baseUrl).hostname.toLowerCase();
        allowed.push(baseHost);
      } catch {
        // ignore invalid base url
      }
    }

    // Custom domains
    if (config.qr.customDomainEnabled) {
      for (const d of config.qr.domainAliases) {
        const dom = (d || '').trim().toLowerCase();
        if (dom) allowed.push(dom);
      }
    }

    if (config.qr.rootDomain) {
      const dom = (config.qr.rootDomain || '').trim().toLowerCase();
      if (dom) allowed.push(dom);
    }

    if (allowed.includes(host)) {
      next();
      return;
    }

    for (const d of allowed) {
      if (host.endsWith(`.${d}`)) {
        next();
        return;
      }
    }

    res.status(403).json({
      success: false,
      error: 'Domain not allowed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Domain validation error',
    });
  }
};
