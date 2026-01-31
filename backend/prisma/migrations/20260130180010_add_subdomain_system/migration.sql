/*
  Warnings:

  - A unique constraint covering the columns `[subdomain]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[approvedCustomDomain]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "qr_codes" ADD COLUMN     "customDomainEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "approvedCustomDomain" TEXT,
ADD COLUMN     "customDomainEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subdomain" TEXT,
ADD COLUMN     "subdomainHistory" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "custom_domains" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dnsVerified" BOOLEAN NOT NULL DEFAULT false,
    "sslConfigured" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT NOT NULL,
    "adminNotes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_domains_domain_key" ON "custom_domains"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "custom_domains_verificationToken_key" ON "custom_domains"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_subdomain_key" ON "users"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "users_approvedCustomDomain_key" ON "users"("approvedCustomDomain");

-- AddForeignKey
ALTER TABLE "custom_domains" ADD CONSTRAINT "custom_domains_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
