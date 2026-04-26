CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "user_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "total_goals" INTEGER NOT NULL DEFAULT 0,
    "completed_goals" INTEGER NOT NULL DEFAULT 0,
    "total_documents" INTEGER NOT NULL DEFAULT 0,
    "total_quizzes" INTEGER NOT NULL DEFAULT 0,
    "avg_quiz_score" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "study_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quiz_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_stats_user_id_key" ON "user_stats"("user_id");
CREATE INDEX "user_stats_updated_at_idx" ON "user_stats"("updated_at");

CREATE UNIQUE INDEX "quiz_metrics_quiz_id_key" ON "quiz_metrics"("quiz_id");
CREATE INDEX "quiz_metrics_user_id_idx" ON "quiz_metrics"("user_id");

CREATE INDEX "activity_log_user_id_created_at_idx" ON "activity_log"("user_id", "created_at" DESC);
CREATE INDEX "activity_log_action_idx" ON "activity_log"("action");
