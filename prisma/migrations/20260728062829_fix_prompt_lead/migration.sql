-- CreateTable
CREATE TABLE `FixPromptLead` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(320) NOT NULL,
    `slug` VARCHAR(255) NULL,
    `host` VARCHAR(255) NULL,
    `action` VARCHAR(16) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FixPromptLead_email_idx`(`email`),
    INDEX `FixPromptLead_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
