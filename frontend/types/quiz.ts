export type QuizQuestion = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
};

export type QuizItem = {
  id: string;
  documentId: string;
  title?: string;
  createdAt?: string;
  questions: QuizQuestion[];
};
