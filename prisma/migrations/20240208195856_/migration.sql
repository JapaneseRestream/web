-- CreateTable
CREATE TABLE "UserEmailChange" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEmailChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmailChange_userId_key" ON "UserEmailChange"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmailChange_token_key" ON "UserEmailChange"("token");

-- AddForeignKey
ALTER TABLE "UserEmailChange" ADD CONSTRAINT "UserEmailChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
