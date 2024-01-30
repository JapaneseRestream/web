/*
  Warnings:

  - You are about to drop the `UserPasskeyAuthenticator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPasskeyChallenge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPasskeyAuthenticator" DROP CONSTRAINT "UserPasskeyAuthenticator_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPasskeyChallenge" DROP CONSTRAINT "UserPasskeyChallenge_userId_fkey";

-- DropTable
DROP TABLE "UserPasskeyAuthenticator";

-- DropTable
DROP TABLE "UserPasskeyChallenge";

-- CreateTable
CREATE TABLE "user_passkey_challenges" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "challenge" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_passkey_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_passkey_authenticators" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "credentialId" BYTEA NOT NULL,
    "credentialPublicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT[],
    "aaguid" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_passkey_authenticators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_passkey_challenges_userId_key" ON "user_passkey_challenges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_passkey_authenticators_credentialId_key" ON "user_passkey_authenticators"("credentialId");

-- AddForeignKey
ALTER TABLE "user_passkey_challenges" ADD CONSTRAINT "user_passkey_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_passkey_authenticators" ADD CONSTRAINT "user_passkey_authenticators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
