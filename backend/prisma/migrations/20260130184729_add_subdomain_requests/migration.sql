-- CreateTable
CREATE TABLE "subdomain_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedSubdomain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "subdomain_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subdomain_requests_userId_idx" ON "subdomain_requests"("userId");

-- CreateIndex
CREATE INDEX "subdomain_requests_status_idx" ON "subdomain_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "subdomain_requests_requestedSubdomain_key" ON "subdomain_requests"("requestedSubdomain");

-- AddForeignKey
ALTER TABLE "subdomain_requests" ADD CONSTRAINT "subdomain_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
