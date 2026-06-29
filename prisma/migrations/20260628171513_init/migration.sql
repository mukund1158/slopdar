-- CreateTable
CREATE TABLE `Check` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(2048) NOT NULL,
    `urlHash` CHAR(64) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `host` VARCHAR(255) NOT NULL,
    `finalUrl` VARCHAR(2048) NULL,
    `score` INTEGER NOT NULL,
    `tier` VARCHAR(64) NOT NULL,
    `screenshot` VARCHAR(512) NULL,
    `title` VARCHAR(512) NULL,
    `scanError` TEXT NULL,
    `checkCount` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Check_urlHash_key`(`urlHash`),
    UNIQUE INDEX `Check_slug_key`(`slug`),
    INDEX `Check_score_idx`(`score`),
    INDEX `Check_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Signal` (
    `id` VARCHAR(191) NOT NULL,
    `checkId` VARCHAR(191) NOT NULL,
    `signalId` VARCHAR(128) NOT NULL,
    `category` VARCHAR(64) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `weight` INTEGER NOT NULL,
    `evidence` TEXT NULL,

    INDEX `Signal_checkId_idx`(`checkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TechStack` (
    `id` VARCHAR(191) NOT NULL,
    `checkId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `category` VARCHAR(64) NULL,
    `confidence` INTEGER NOT NULL DEFAULT 100,

    INDEX `TechStack_checkId_idx`(`checkId`),
    UNIQUE INDEX `TechStack_checkId_name_key`(`checkId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(320) NOT NULL,
    `name` VARCHAR(255) NULL,
    `image` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedSite` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `checkId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SavedSite_userId_idx`(`userId`),
    UNIQUE INDEX `SavedSite_userId_checkId_key`(`userId`, `checkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Signal` ADD CONSTRAINT `Signal_checkId_fkey` FOREIGN KEY (`checkId`) REFERENCES `Check`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TechStack` ADD CONSTRAINT `TechStack_checkId_fkey` FOREIGN KEY (`checkId`) REFERENCES `Check`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedSite` ADD CONSTRAINT `SavedSite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedSite` ADD CONSTRAINT `SavedSite_checkId_fkey` FOREIGN KEY (`checkId`) REFERENCES `Check`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
