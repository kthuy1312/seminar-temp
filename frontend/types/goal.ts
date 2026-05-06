export type Milestone = {
  id: string;
  title: string;
  due_date?: string | null;
  is_done: boolean;
};

export type GoalItem = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  target_date?: string | null;
  status?: string;
  progress?: number;
  milestones?: Milestone[];
};
