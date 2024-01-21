-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDiscord" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "discordId" VARCHAR(255) NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDiscord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailAuthentication" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAuthentication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRegistration" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "UserSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserDiscord_userId_key" ON "UserDiscord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDiscord_discordId_key" ON "UserDiscord"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAuthentication_userId_key" ON "EmailAuthentication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAuthentication_token_key" ON "EmailAuthentication"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegistration_email_key" ON "UserRegistration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegistration_token_key" ON "UserRegistration"("token");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDiscord" ADD CONSTRAINT "UserDiscord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAuthentication" ADD CONSTRAINT "EmailAuthentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
