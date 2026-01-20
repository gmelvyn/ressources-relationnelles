-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "rrb";

-- CreateEnum
CREATE TYPE "rrb"."Role" AS ENUM ('CITIZEN', 'MODERATOR', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "rrb"."Visibility" AS ENUM ('PRIVATE', 'SHARED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "rrb"."ResourceStatus" AS ENUM ('PENDING', 'PUBLISHED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "rrb"."StatType" AS ENUM ('VIEW_RESOURCE', 'SEARCH', 'SHARE', 'CREATE_RESOURCE');

-- CreateTable
CREATE TABLE "rrb"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "role" "rrb"."Role" NOT NULL DEFAULT 'CITIZEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."Resource" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" "rrb"."Visibility" NOT NULL,
    "status" "rrb"."ResourceStatus" NOT NULL DEFAULT 'PENDING',
    "categoryId" INTEGER NOT NULL,
    "relationTypeId" INTEGER NOT NULL,
    "resourceTypeId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."RelationType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RelationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."ResourceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ResourceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "moderated" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."UserResourceProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "exploited" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserResourceProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."ActivitySession" (
    "id" SERIAL NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivitySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."ActivityParticipant" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ActivityParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."ActivityMessage" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrb"."StatEvent" (
    "id" SERIAL NOT NULL,
    "event" "rrb"."StatType" NOT NULL,
    "userId" INTEGER,
    "resourceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "rrb"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "rrb"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RelationType_name_key" ON "rrb"."RelationType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceType_name_key" ON "rrb"."ResourceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserResourceProgress_userId_resourceId_key" ON "rrb"."UserResourceProgress"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityParticipant_sessionId_userId_key" ON "rrb"."ActivityParticipant"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "rrb"."Resource" ADD CONSTRAINT "Resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "rrb"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."Resource" ADD CONSTRAINT "Resource_relationTypeId_fkey" FOREIGN KEY ("relationTypeId") REFERENCES "rrb"."RelationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."Resource" ADD CONSTRAINT "Resource_resourceTypeId_fkey" FOREIGN KEY ("resourceTypeId") REFERENCES "rrb"."ResourceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."Resource" ADD CONSTRAINT "Resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "rrb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "rrb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."Comment" ADD CONSTRAINT "Comment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "rrb"."Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "rrb"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."UserResourceProgress" ADD CONSTRAINT "UserResourceProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "rrb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."UserResourceProgress" ADD CONSTRAINT "UserResourceProgress_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "rrb"."Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."ActivitySession" ADD CONSTRAINT "ActivitySession_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "rrb"."Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."ActivitySession" ADD CONSTRAINT "ActivitySession_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "rrb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."ActivityParticipant" ADD CONSTRAINT "ActivityParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "rrb"."ActivitySession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."ActivityParticipant" ADD CONSTRAINT "ActivityParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "rrb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."ActivityMessage" ADD CONSTRAINT "ActivityMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "rrb"."ActivitySession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."ActivityMessage" ADD CONSTRAINT "ActivityMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "rrb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."StatEvent" ADD CONSTRAINT "StatEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "rrb"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrb"."StatEvent" ADD CONSTRAINT "StatEvent_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "rrb"."Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
