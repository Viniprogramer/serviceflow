-- Add persisted metadata/content for work order photos.
ALTER TABLE "WorkOrderPhoto"
ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "dataBase64" TEXT;
