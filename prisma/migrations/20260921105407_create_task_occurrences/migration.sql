-- CreateEnum
CREATE TYPE "task_occurrence_status" AS ENUM ('DONE', 'CANCELLED', 'SKIPPED');

-- CreateTable
CREATE TABLE "task_occurrences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "occurrence_date" DATE NOT NULL,
    "status" "task_occurrence_status" NOT NULL,
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "task_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_occurrences_task_id_occurrence_date_key" ON "task_occurrences"("task_id", "occurrence_date");

-- AddForeignKey
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
