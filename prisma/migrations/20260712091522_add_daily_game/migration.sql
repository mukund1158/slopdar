-- AlterTable
ALTER TABLE `Check` ADD COLUMN `gameHidden` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `bestStreak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `currentStreak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `emailVerified` DATETIME(3) NULL,
    ADD COLUMN `handle` VARCHAR(32) NULL,
    ADD COLUMN `lastPlayedDay` DATE NULL,
    ADD COLUMN `websiteCheckId` VARCHAR(191) NULL,
    ADD COLUMN `websiteUrl` VARCHAR(512) NULL;

-- CreateTable
CREATE TABLE `PlayResult` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `day` DATE NOT NULL,
    `correct` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `streak` INTEGER NOT NULL,
    `durationMs` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlayResult_day_score_idx`(`day`, `score`),
    UNIQUE INDEX `PlayResult_userId_day_key`(`userId`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeaturedSite` (
    `id` VARCHAR(191) NOT NULL,
    `day` DATE NOT NULL,
    `checkId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rank` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FeaturedSite_day_idx`(`day`),
    UNIQUE INDEX `FeaturedSite_day_rank_key`(`day`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `Account_userId_idx`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Check_gameHidden_score_idx` ON `Check`(`gameHidden`, `score`);

-- CreateIndex
CREATE UNIQUE INDEX `User_handle_key` ON `User`(`handle`);

-- CreateIndex
CREATE INDEX `User_websiteCheckId_idx` ON `User`(`websiteCheckId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_websiteCheckId_fkey` FOREIGN KEY (`websiteCheckId`) REFERENCES `Check`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayResult` ADD CONSTRAINT `PlayResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeaturedSite` ADD CONSTRAINT `FeaturedSite_checkId_fkey` FOREIGN KEY (`checkId`) REFERENCES `Check`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeaturedSite` ADD CONSTRAINT `FeaturedSite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

