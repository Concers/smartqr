-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "originalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_destinations" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "activeFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "url_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_analytics" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_shortCode_key" ON "qr_codes"("shortCode");

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url_destinations" ADD CONSTRAINT "url_destinations_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_analytics" ADD CONSTRAINT "qr_analytics_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
