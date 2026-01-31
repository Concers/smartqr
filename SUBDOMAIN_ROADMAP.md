# Custom Subdomain Sistemi Yol Haritası

## 🎯 **Proje Tanımı**
Kullanıcıların `netqr.io` üzerinde custom subdomain'ler (`{subdomain}.netqr.io/{custom-qr-code}`) alabildiği, admin onayı ile custom domain yönetebildiği sistem.

## 📋 **Genel Bakış**
- **Ana Domain:** `netqr.io`
- **URL Formatı:** `{subdomain}.netqr.io/{custom-qr-code}`
- **Subdomain Formatı:** `user-{10 karakter random}`
- **Onay Süreci:** Admin tarafından manuel onay
- **SSL:** Wildcard SSL gelecek

---

## 🗄️ **Phase 1: Database Schema Design**

### 1.1 User Tablosu Eklentiler
```sql
-- Mevcut users tablosuna eklenecek kolonlar
ALTER TABLE users ADD COLUMN subdomain VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN subdomain_history JSONB DEFAULT '[]'; -- Tüm kullanılan subdomainler
ALTER TABLE users ADD COLUMN custom_domain_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN approved_custom_domain VARCHAR(255);
```

### 1.2 Custom Domain Tablosu
```sql
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  dns_verified BOOLEAN DEFAULT FALSE,
  ssl_configured BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255) UNIQUE, -- DNS doğrulama için
  admin_notes TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_custom_domains_user_id ON custom_domains(user_id);
CREATE INDEX idx_custom_domains_status ON custom_domains(status);
```

### 1.3 QR Codes Tablosu Eklentiler
```sql
ALTER TABLE qr_codes ADD COLUMN custom_domain_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE qr_codes ADD COLUMN custom_url VARCHAR(255); -- Generated custom URL
```

---

## ⚙️ **Phase 2: Core Backend Services**

### 2.1 Subdomain Generator Service
```typescript
// src/services/subdomainService.ts
export class SubdomainService {
  private readonly SUBDOMAIN_PREFIX = 'user-';
  private readonly SUBDOMAIN_LENGTH = 10;

  /**
   * Rastgele subdomain generate eder
   * Format: user-{10 karakter random}
   */
  generateRandomSubdomain(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    
    for (let i = 0; i < this.SUBDOMAIN_LENGTH; i++) {
      randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `${this.SUBDOMAIN_PREFIX}${randomString}`;
  }

  /**
   * Subdomain'in kullanılabilir olup olmadığını kontrol eder
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    const existingUser = await prisma.user.findUnique({
      where: { subdomain }
    });
    return !existingUser;
  }

  /**
   * Kullanıcıya benzersiz subdomain atar
   */
  async assignSubdomainToUser(userId: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const subdomain = this.generateRandomSubdomain();
      
      if (await this.isSubdomainAvailable(subdomain)) {
        // Önceki subdomain'i history'e ekle
        await this.updateSubdomainHistory(userId);
        
        // Yeni subdomain'i ata
        await prisma.user.update({
          where: { id: userId },
          data: { subdomain }
        });
        
        return subdomain;
      }
      
      attempts++;
    }
    
    throw new Error('Unable to generate unique subdomain');
  }

  /**
   * Subdomain değiştirme history'sini günceller
   */
  async updateSubdomainHistory(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subdomain: true, subdomain_history: true }
    });

    if (user?.subdomain) {
      const history = user.subdomain_history as string[] || [];
      history.push({
        subdomain: user.subdomain,
        changed_at: new Date().toISOString()
      });

      await prisma.user.update({
        where: { id: userId },
        data: { subdomain_history: history }
      });
    }
  }

  /**
   * Kullanıcının subdomain history'sini getirir
   */
  async getSubdomainHistory(userId: string): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subdomain_history: true }
    });

    return user?.subdomain_history as any[] || [];
  }
}
```

### 2.2 Custom Domain Service
```typescript
// src/services/customDomainService.ts
export class CustomDomainService {
  /**
   * Custom domain isteği oluşturur
   */
  async requestCustomDomain(userId: string, domain: string): Promise<void> {
    // Domain formatını kontrol et
    if (!this.isValidDomain(domain)) {
      throw new Error('Invalid domain format');
    }

    // DNS doğrulama token'ı oluştur
    const verificationToken = this.generateVerificationToken();

    await prisma.customDomain.create({
      data: {
        user_id: userId,
        domain: domain.toLowerCase(),
        verification_token: verificationToken,
        status: 'pending'
      }
    });
  }

  /**
   * DNS sahipliğini doğrular
   */
  async verifyDNSOwnership(domain: string, token: string): Promise<boolean> {
    try {
      // TXT record kontrolü
      const txtRecords = await dns.resolveTxt(domain);
      const hasValidRecord = txtRecords.some(record => 
        record.includes(`netqr-verification=${token}`)
      );

      if (hasValidRecord) {
        await prisma.customDomain.update({
          where: { domain: domain.toLowerCase() },
          data: { dns_verified: true }
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('DNS verification failed:', error);
      return false;
    }
  }

  /**
   * Admin tarafından domain onayı
   */
  async approveDomain(domainId: string, adminId: string): Promise<void> {
    const domain = await prisma.customDomain.findUnique({
      where: { id: domainId },
      include: { user: true }
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    // User'ın custom domain'ini güncelle
    await prisma.user.update({
      where: { id: domain.user_id },
      data: {
        approved_custom_domain: domain.domain,
        custom_domain_enabled: true
      }
    });

    // Domain'i onayla
    await prisma.customDomain.update({
      where: { id: domainId },
      data: {
        status: 'approved',
        approved_at: new Date()
      }
    });

    // SSL konfigürasyonu başlat (gelecekte)
    // await this.configureSSL(domain.domain);
  }

  /**
   * Admin tarafından domain reddi
   */
  async rejectDomain(domainId: string, reason: string): Promise<void> {
    await prisma.customDomain.update({
      where: { id: domainId },
      data: {
        status: 'rejected',
        rejected_at: new Date(),
        admin_notes: reason
      }
    });
  }

  /**
   * Domain formatını validate eder
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  }

  /**
   * DNS doğrulama token'ı oluşturur
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

---

## 🛣️ **Phase 3: API Endpoints**

### 3.1 Subdomain Management
```typescript
// src/routes/subdomain.ts
router.get('/subdomain', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { subdomain: true, subdomain_history: true }
  });
  
  res.json({
    subdomain: user?.subdomain,
    history: user?.subdomain_history
  });
});

router.post('/subdomain/change', authenticate, async (req, res) => {
  const subdomainService = new SubdomainService();
  const newSubdomain = await subdomainService.assignSubdomainToUser(req.user.id);
  
  res.json({ subdomain: newSubdomain });
});

router.get('/subdomain/history', authenticate, async (req, res) => {
  const subdomainService = new SubdomainService();
  const history = await subdomainService.getSubdomainHistory(req.user.id);
  
  res.json({ history });
});
```

### 3.2 Custom Domain Management
```typescript
// src/routes/customDomain.ts
router.post('/request', authenticate, async (req, res) => {
  const { domain } = req.body;
  const customDomainService = new CustomDomainService();
  
  await customDomainService.requestCustomDomain(req.user.id, domain);
  
  res.json({ 
    message: 'Domain request submitted',
    verification_instructions: `Add TXT record: netqr-verification=${token}`
  });
});

router.get('/:domain/verify-dns', authenticate, async (req, res) => {
  const { domain } = req.params;
  const customDomainService = new CustomDomainService();
  
  const verified = await customDomainService.verifyDNSOwnership(domain, token);
  
  res.json({ verified });
});
```

### 3.3 Admin Endpoints
```typescript
// src/routes/admin/customDomain.ts
router.get('/custom-domains', requireAdmin, async (req, res) => {
  const domains = await prisma.customDomain.findMany({
    include: {
      user: {
        select: { email: true, subdomain: true }
      }
    },
    orderBy: { requested_at: 'desc' }
  });
  
  res.json({ domains });
});

router.post('/custom-domain/:id/approve', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const customDomainService = new CustomDomainService();
  
  await customDomainService.approveDomain(id, req.user.id);
  
  res.json({ message: 'Domain approved' });
});

router.post('/custom-domain/:id/reject', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const customDomainService = new CustomDomainService();
  
  await customDomainService.rejectDomain(id, reason);
  
  res.json({ message: 'Domain rejected' });
});
```

---

## 🔄 **Phase 4: URL Routing & Middleware**

### 4.1 Subdomain Middleware
```typescript
// src/middleware/subdomainMiddleware.ts
export const subdomainMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostname = req.hostname;
    const subdomain = hostname.replace('.netqr.io', '');

    if (subdomain && subdomain !== 'www' && subdomain !== 'netqr') {
      const user = await prisma.user.findUnique({
        where: { subdomain },
        include: {
          qr_codes: {
            where: { custom_domain_enabled: true }
          }
        }
      });

      if (user && user.custom_domain_enabled) {
        req.subdomainUser = user;
        req.isCustomSubdomain = true;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

### 4.2 QR URL Generator
```typescript
// src/utils/urlGenerator.ts
export const generateQRUrl = (shortCode: string, user: User): string => {
  if (user.custom_domain_enabled && user.approved_custom_domain) {
    return `https://${user.subdomain}.netqr.io/${shortCode}`;
  }
  return `https://netqr.io/${shortCode}`;
};

export const generateCustomQRUrl = (shortCode: string, customDomain: string): string => {
  return `https://${customDomain}/${shortCode}`;
};
```

---

## 👨‍💼 **Phase 5: Admin Panel Features**

### 5.1 Custom Domain Listesi
```typescript
// src/controllers/adminController.ts
export const getCustomDomainList = async (req: Request, res: Response) => {
  const { status, page = 1, limit = 20 } = req.query;
  
  const where = status ? { status } : {};
  
  const domains = await prisma.customDomain.findMany({
    where,
    include: {
      user: {
        select: { email: true, subdomain: true, created_at: true }
      }
    },
    orderBy: { requested_at: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit)
  });

  const total = await prisma.customDomain.count({ where });

  res.json({
    domains,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
};
```

### 5.2 Bulk Operations
```typescript
export const bulkApproveDomains = async (req: Request, res: Response) => {
  const { domainIds } = req.body;
  const customDomainService = new CustomDomainService();
  
  for (const domainId of domainIds) {
    await customDomainService.approveDomain(domainId, req.user.id);
  }
  
  res.json({ message: `${domainIds.length} domains approved` });
};

export const bulkRejectDomains = async (req: Request, res: Response) => {
  const { domainIds, reason } = req.body;
  const customDomainService = new CustomDomainService();
  
  for (const domainId of domainIds) {
    await customDomainService.rejectDomain(domainId, reason);
  }
  
  res.json({ message: `${domainIds.length} domains rejected` });
};
```

---

## 📅 **Phase 6: Implementation Timeline**

### Hafta 1: Foundation
- [ ] Database schema migration'ları
- [ ] Subdomain generator service
- [ ] Basic user subdomain assignment

### Hafta 2: Core APIs
- [ ] Subdomain management endpoints
- [ ] Custom domain request system
- [ ] Basic validation and error handling

### Hafta 3: Admin System
- [ ] Admin panel endpoints
- [ ] Approval workflow
- [ ] Bulk operations

### Hafta 4: URL Routing
- [ ] Subdomain middleware
- [ ] QR URL generation logic
- [ ] Custom domain URL handling

### Hafta 5: SSL & DNS
- [ ] DNS verification system
- [ ] SSL configuration preparation
- [ ] Security hardening

### Hafta 6: Testing & Polish
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Documentation

---

## 📦 **Phase 7: Technical Requirements**

### 7.1 Gerekli NPM Paketleri
```json
{
  "dependencies": {
    "crypto": "built-in",
    "dns": "built-in", 
    "express": "^4.18.0",
    "@prisma/client": "^5.0.0",
    "joi": "^17.9.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "prisma": "^5.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

### 7.2 Environment Variables
```env
# Subdomain settings
SUBDOMAIN_PREFIX=user-
SUBDOMAIN_LENGTH=10
MAIN_DOMAIN=netqr.io

# Custom domain settings
CUSTOM_DOMAIN_ADMIN_EMAIL=admin@netqr.io
DNS_VERIFICATION_TIMEOUT=300000
MAX_SUBDOMAIN_ATTEMPTS=100

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# SSL (gelecekte)
SSL_CERT_PATH=/path/to/wildcard.crt
SSL_KEY_PATH=/path/to/wildcard.key
```

### 7.3 Prisma Schema Updates
```prisma
model User {
  // ... existing fields
  subdomain            String?   @unique
  subdomain_history    Json      @default("[]")
  custom_domain_enabled Boolean   @default(false)
  approved_custom_domain String?  @unique
  
  // Relations
  custom_domains       CustomDomain[]
}

model CustomDomain {
  id                  String    @id @default(cuid())
  user_id             String
  domain              String    @unique
  status              String    @default("pending")
  dns_verified        Boolean   @default(false)
  ssl_configured      Boolean   @default(false)
  verification_token  String    @unique
  admin_notes         String?
  requested_at        DateTime  @default(now())
  approved_at         DateTime?
  rejected_at         DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  user                User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@map("custom_domains")
}
```

---

## 🚀 **Başlangıç Adımları**

### İlk Implementasyon (Hafta 1)
1. **Database Migration'ları**
   ```bash
   npx prisma migrate dev --name add-subdomain-system
   ```

2. **Subdomain Service Test**
   ```typescript
   // Test subdomain generation
   const subdomainService = new SubdomainService();
   const subdomain = await subdomainService.assignSubdomainToUser('user-id');
   console.log(subdomain); // user-abc123def4
   ```

3. **User Registration Integration**
   ```typescript
   // Mevcut registration'a ekle
   const newUser = await prisma.user.create({
     data: {
       email,
       password: hashedPassword,
       subdomain: await subdomainService.assignSubdomainToUser(userId)
     }
   });
   ```

---

## 📝 **Notlar & Kararlar**

- **Security**: DNS doğrulama token'ları 24 saat sonra expire olacak
- **Performance**: Subdomain lookup için cache eklenecek
- **Monitoring**: Custom domain istekleri için loglama sistemi
- **Backup**: Subdomain history kalıcı olarak saklanacak
- **Rate Limiting**: Subdomain değiştirme için limit (ayda 1 kez)

---

## ✅ **Checklist**

### Database
- [ ] Migration dosyaları oluşturuldu
- [ ] Index'ler eklendi
- [ ] Test data hazırlandı

### Services
- [ ] SubdomainService implement edildi
- [ ] CustomDomainService implement edildi
- [ ] Unit tests yazıldı

### APIs
- [ ] Authentication middleware hazır
- [ ] Validation rules eklendi
- [ ] Error handling tamamlandı

### Admin Panel
- [ ] Admin yetkilendirmesi
- [ ] Bulk operations
- [ ] Email notifications

### Security
- [ ] Input validation
- [ ] SQL injection protection
- [ ] Rate limiting
- [ ] HTTPS enforcement

---

**Bu roadmap proje boyunca güncellenecektir. Her phase tamamlandığında ilgili bölüm işaretlenecektir.**
