export const DASHBOARD_ACTIONS = {
  USER_CREATED: 'user_created',
  GOAL_CREATED: 'goal_created',
  GOAL_COMPLETED: 'goal_completed',
  DOCUMENT_UPLOADED: 'document_uploaded',
  QUIZ_COMPLETED: 'quiz_completed',
  ROADMAP_STEP_COMPLETED: 'roadmap_step_completed',
  SUMMARY_CREATED: 'summary_created',
} as const;

export type DashboardAction =
  (typeof DASHBOARD_ACTIONS)[keyof typeof DASHBOARD_ACTIONS];
