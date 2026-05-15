export type Milestone = {
  id: string;
  title: string;
  due_date?: string | null;
  is_done: boolean;
};

export type RoadmapItem = {
  id: string;
  day: number;
  skill?: string | null;
  topic: string;
  activity?: string | null;
  duration?: string | null;
  priority?: string | null;
  is_completed: boolean;
};

export type AiAnalysis = {
  gap_analysis?: string;
  priority_skills?: Array<{ skill: string; reason: string }>;
  priority_subjects?: string[];
  feasibility?: string;
  feasibility_note?: string;
  learning_strategy?: string;
  difficulty_level?: string;
  suggestions?: string[];
};

export type GoalItem = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  target_date?: string | null;
  status?: string;
  progress?: number;
  target_score?: string | null;
  current_level?: string | null;
  daily_hours?: number | null;
  subjects?: string[];
  ai_analysis?: AiAnalysis | null;
  milestones?: Milestone[];
  roadmap_items?: RoadmapItem[];
};
