-- Add archived column to notifications table to support trash functionality
-- Run this SQL migration to enable move to trash for sent messages

ALTER TABLE `notifications` 
ADD COLUMN `archived` TINYINT(1) NOT NULL DEFAULT 0 AFTER `starred`;

-- Index for performance when filtering archived notifications
CREATE INDEX idx_archived ON `notifications` (`archived`);

-- Optional: Add comment for documentation
ALTER TABLE `notifications` 
MODIFY COLUMN `archived` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT '0 = active, 1 = archived/trashed';
