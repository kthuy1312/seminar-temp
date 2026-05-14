export declare const DASHBOARD_ACTIONS: {
    readonly USER_CREATED: "user_created";
    readonly GOAL_CREATED: "goal_created";
    readonly GOAL_COMPLETED: "goal_completed";
    readonly DOCUMENT_UPLOADED: "document_uploaded";
    readonly QUIZ_COMPLETED: "quiz_completed";
    readonly ROADMAP_STEP_COMPLETED: "roadmap_step_completed";
    readonly SUMMARY_CREATED: "summary_created";
};
export type DashboardAction = (typeof DASHBOARD_ACTIONS)[keyof typeof DASHBOARD_ACTIONS];
