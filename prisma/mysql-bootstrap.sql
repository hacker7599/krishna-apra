-- CreateTable
CREATE TABLE `PaymentOrder` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `razorpayOrderId` VARCHAR(191) NOT NULL,
    `amountPaise` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `status` VARCHAR(191) NOT NULL DEFAULT 'created',
    `razorpayPaymentId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `playerName` VARCHAR(191) NULL,
    `receipt` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `registrationId` VARCHAR(191) NULL,

    UNIQUE INDEX `PaymentOrder_razorpayOrderId_key`(`razorpayOrderId`),
    UNIQUE INDEX `PaymentOrder_registrationId_key`(`registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `source` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `razorpayOrderId` VARCHAR(191) NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `razorpayEventId` VARCHAR(191) NULL,
    `amountPaise` INTEGER NULL,
    `currency` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `playerName` VARCHAR(191) NULL,
    `registrationId` VARCHAR(191) NULL,
    `paymentOrderId` VARCHAR(191) NULL,
    `clientIp` VARCHAR(191) NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `message` VARCHAR(191) NULL,
    `metadata` TEXT NULL,

    UNIQUE INDEX `PaymentLog_razorpayEventId_key`(`razorpayEventId`),
    INDEX `PaymentLog_razorpayOrderId_idx`(`razorpayOrderId`),
    INDEX `PaymentLog_createdAt_idx`(`createdAt`),
    INDEX `PaymentLog_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `summary` VARCHAR(191) NOT NULL,
    `metadata` TEXT NULL,
    `clientIp` VARCHAR(191) NULL,

    INDEX `AdminAuditLog_createdAt_idx`(`createdAt`),
    INDEX `AdminAuditLog_entityType_idx`(`entityType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `templateKey` VARCHAR(191) NOT NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NULL,
    `success` BOOLEAN NOT NULL DEFAULT false,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'msg91',
    `providerMsgId` VARCHAR(191) NULL,
    `error` TEXT NULL,
    `metadata` TEXT NULL,

    INDEX `EmailLog_createdAt_idx`(`createdAt`),
    INDEX `EmailLog_toEmail_idx`(`toEmail`),
    INDEX `EmailLog_templateKey_idx`(`templateKey`),
    INDEX `EmailLog_registrationId_idx`(`registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateLimitEvent` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bucket` VARCHAR(191) NOT NULL,

    INDEX `RateLimitEvent_bucket_createdAt_idx`(`bucket`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrationCompletionInvite` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `paymentOrderId` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `RegistrationCompletionInvite_tokenHash_key`(`tokenHash`),
    UNIQUE INDEX `RegistrationCompletionInvite_paymentOrderId_key`(`paymentOrderId`),
    INDEX `RegistrationCompletionInvite_expiresAt_idx`(`expiresAt`),
    INDEX `RegistrationCompletionInvite_usedAt_idx`(`usedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrationAccessOtp` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `otpHash` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `usedAt` DATETIME(3) NULL,

    INDEX `RegistrationAccessOtp_email_createdAt_idx`(`email`, `createdAt`),
    INDEX `RegistrationAccessOtp_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Registration` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `academyName` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `roles` VARCHAR(191) NOT NULL,
    `trialZoneId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `fatherName` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `jerseySize` VARCHAR(191) NULL,
    `shoeSize` VARCHAR(191) NULL,
    `idDocumentType` VARCHAR(191) NULL,
    `idProofPath` VARCHAR(191) NULL,
    `playerPhotoPath` VARCHAR(191) NULL,
    `paymentProofPath` VARCHAR(191) NULL,
    `transactionRef` VARCHAR(191) NULL,
    `achievementsAndAwards` TEXT NULL,
    `feeReceivedDate` VARCHAR(191) NULL,
    `coachName` VARCHAR(191) NULL,
    `paymentStatus` VARCHAR(191) NULL,
    `razorpayOrderId` VARCHAR(191) NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,

    UNIQUE INDEX `Registration_email_key`(`email`),
    UNIQUE INDEX `Registration_phone_key`(`phone`),
    UNIQUE INDEX `Registration_razorpayOrderId_key`(`razorpayOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `accentColor` VARCHAR(191) NOT NULL DEFAULT '#1B365D',
    `logoPath` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Team_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HeroBanner` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `ctaLabel` VARCHAR(191) NULL,
    `ctaHref` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrialZone` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `trialPlace` VARCHAR(191) NOT NULL,
    `zone` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `navigationUrl` VARCHAR(191) NULL,
    `contactDetails` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrialSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `trialZoneId` VARCHAR(191) NULL,

    INDEX `TrialSchedule_published_scheduledAt_idx`(`published`, `scheduledAt`),
    INDEX `TrialSchedule_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL DEFAULT '',
    `content` TEXT NOT NULL,
    `coverImageUrl` VARCHAR(191) NULL,
    `authorName` VARCHAR(191) NOT NULL DEFAULT '',
    `published` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `metaKeywords` VARCHAR(191) NULL,
    `ogImageUrl` VARCHAR(191) NULL,
    `canonicalUrl` VARCHAR(191) NULL,
    `robotsNoindex` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_published_publishedAt_idx`(`published`, `publishedAt`),
    INDEX `BlogPost_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppConfig` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `paymentMode` VARCHAR(191) NOT NULL DEFAULT 'razorpay',
    `paymentQrPath` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentOrder` ADD CONSTRAINT `PaymentOrder_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentLog` ADD CONSTRAINT `PaymentLog_paymentOrderId_fkey` FOREIGN KEY (`paymentOrderId`) REFERENCES `PaymentOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistrationCompletionInvite` ADD CONSTRAINT `RegistrationCompletionInvite_paymentOrderId_fkey` FOREIGN KEY (`paymentOrderId`) REFERENCES `PaymentOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_trialZoneId_fkey` FOREIGN KEY (`trialZoneId`) REFERENCES `TrialZone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrialSchedule` ADD CONSTRAINT `TrialSchedule_trialZoneId_fkey` FOREIGN KEY (`trialZoneId`) REFERENCES `TrialZone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

