-- CreateTable
CREATE TABLE "resource_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#0f766e',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relation_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relation_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "supportsActivity" BOOLEAN NOT NULL DEFAULT false,
    "supportsMessaging" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "imageUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "durationMinutes" INTEGER,
    "difficulty" TEXT NOT NULL DEFAULT 'accessible',
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "categoryId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_relation" (
    "resourceId" TEXT NOT NULL,
    "relationTypeId" TEXT NOT NULL,

    CONSTRAINT "resource_relation_pkey" PRIMARY KEY ("resourceId","relationTypeId")
);

-- CreateTable
CREATE TABLE "resource_progress" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "exploitedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "resource_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VISIBLE',
    "moderationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resourceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "resource_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_session" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resourceId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "activity_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_session_participant" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_session_participant_pkey" PRIMARY KEY ("sessionId","userId")
);

-- CreateTable
CREATE TABLE "activity_message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "activity_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_moderation" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resourceId" TEXT,
    "moderatorId" TEXT,

    CONSTRAINT "resource_moderation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resource_category_name_key" ON "resource_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_category_slug_key" ON "resource_category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "relation_type_name_key" ON "relation_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "relation_type_slug_key" ON "relation_type"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "resource_type_name_key" ON "resource_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_type_slug_key" ON "resource_type"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "resource_slug_key" ON "resource"("slug");

-- CreateIndex
CREATE INDEX "resource_categoryId_idx" ON "resource"("categoryId");

-- CreateIndex
CREATE INDEX "resource_typeId_idx" ON "resource"("typeId");

-- CreateIndex
CREATE INDEX "resource_authorId_idx" ON "resource"("authorId");

-- CreateIndex
CREATE INDEX "resource_status_visibility_idx" ON "resource"("status", "visibility");

-- CreateIndex
CREATE INDEX "resource_relation_relationTypeId_idx" ON "resource_relation"("relationTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_progress_userId_resourceId_key" ON "resource_progress"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "resource_progress_resourceId_idx" ON "resource_progress"("resourceId");

-- CreateIndex
CREATE INDEX "resource_comment_resourceId_idx" ON "resource_comment"("resourceId");

-- CreateIndex
CREATE INDEX "resource_comment_authorId_idx" ON "resource_comment"("authorId");

-- CreateIndex
CREATE INDEX "resource_comment_parentId_idx" ON "resource_comment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_session_inviteCode_key" ON "activity_session"("inviteCode");

-- CreateIndex
CREATE INDEX "activity_session_resourceId_idx" ON "activity_session"("resourceId");

-- CreateIndex
CREATE INDEX "activity_session_ownerId_idx" ON "activity_session"("ownerId");

-- CreateIndex
CREATE INDEX "activity_session_participant_userId_idx" ON "activity_session_participant"("userId");

-- CreateIndex
CREATE INDEX "activity_message_sessionId_idx" ON "activity_message"("sessionId");

-- CreateIndex
CREATE INDEX "activity_message_authorId_idx" ON "activity_message"("authorId");

-- CreateIndex
CREATE INDEX "resource_moderation_resourceId_idx" ON "resource_moderation"("resourceId");

-- CreateIndex
CREATE INDEX "resource_moderation_moderatorId_idx" ON "resource_moderation"("moderatorId");

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "resource_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "resource_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_relation" ADD CONSTRAINT "resource_relation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_relation" ADD CONSTRAINT "resource_relation_relationTypeId_fkey" FOREIGN KEY ("relationTypeId") REFERENCES "relation_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_progress" ADD CONSTRAINT "resource_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_progress" ADD CONSTRAINT "resource_progress_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_comment" ADD CONSTRAINT "resource_comment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_comment" ADD CONSTRAINT "resource_comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_comment" ADD CONSTRAINT "resource_comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "resource_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_session" ADD CONSTRAINT "activity_session_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_session" ADD CONSTRAINT "activity_session_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_session_participant" ADD CONSTRAINT "activity_session_participant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "activity_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_session_participant" ADD CONSTRAINT "activity_session_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_message" ADD CONSTRAINT "activity_message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "activity_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_message" ADD CONSTRAINT "activity_message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_moderation" ADD CONSTRAINT "resource_moderation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_moderation" ADD CONSTRAINT "resource_moderation_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
