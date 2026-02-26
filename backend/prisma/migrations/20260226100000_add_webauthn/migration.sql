-- CreateTable: WebAuthnCredential
CREATE TABLE "WebAuthnCredential" (
    "id"           TEXT         NOT NULL,
    "userId"       TEXT         NOT NULL,
    "credentialId" TEXT         NOT NULL,
    "publicKey"    TEXT         NOT NULL,
    "counter"      BIGINT       NOT NULL,
    "deviceType"   TEXT         NOT NULL,
    "backedUp"     BOOLEAN      NOT NULL,
    "transports"   TEXT[]       NOT NULL DEFAULT '{}',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt"   TIMESTAMP(3),
    CONSTRAINT "WebAuthnCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WebAuthnChallenge
CREATE TABLE "WebAuthnChallenge" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "challenge" TEXT         NOT NULL,
    "type"      TEXT         NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebAuthnChallenge_pkey" PRIMARY KEY ("id")
);

-- Unique index on credentialId
CREATE UNIQUE INDEX "WebAuthnCredential_credentialId_key"
    ON "WebAuthnCredential"("credentialId");

-- Indexes
CREATE INDEX "WebAuthnCredential_userId_idx"
    ON "WebAuthnCredential"("userId");

CREATE INDEX "WebAuthnChallenge_userId_type_idx"
    ON "WebAuthnChallenge"("userId", "type");

-- Foreign keys
ALTER TABLE "WebAuthnCredential"
    ADD CONSTRAINT "WebAuthnCredential_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WebAuthnChallenge"
    ADD CONSTRAINT "WebAuthnChallenge_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
