-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(27) NOT NULL DEFAULT ksuid_pgcrypto_micros(),
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" CHAR(27) NOT NULL DEFAULT ksuid_pgcrypto_micros(),
    "userId" CHAR(27) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "id" CHAR(27) NOT NULL DEFAULT ksuid_pgcrypto_micros(),
    "credentialId" TEXT NOT NULL,
    "userId" CHAR(27) NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_userId_key" ON "Challenge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialId_key" ON "Authenticator"("credentialId");
