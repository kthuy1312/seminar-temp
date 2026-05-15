export type DashboardStat = {
  label: string;
  value: string;
};

export type DashboardTask = {
  id: string;
  subject: string;
  topic: string;
};

export type DashboardOverview = {
  progressPercent: number;
  stats: DashboardStat[];
  nextTasks: DashboardTask[];
  suggestions: string[];
  skillProgress?: string;
  avgQuizScore?: number;
};

export type DashboardActivity = {
  id: string;
  action: string;
  createdAt?: string;
};
