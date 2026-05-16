export function buildAnalysisFromText(text: string): any {
  return {
    source: 'local',
    questions: [
      {
        questionText: 'What is the main topic of the document?',
        options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
        correctAnswer: 'Topic A',
        explanation: 'Generated locally due to missing AI analysis.'
      }
    ],
    flashcards: [
      {
        front: 'Key concept',
        back: 'Definition'
      }
    ]
  };
}
