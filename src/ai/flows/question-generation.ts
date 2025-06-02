'use server';

/**
 * @fileOverview Question generation flow.
 *
 * This file defines a Genkit flow that generates a coding or conceptual question and a corresponding hint
 * based on a specified topic and difficulty.
 * It exports the QuestionGenerationInput and QuestionGenerationOutput types, as well as the
 * generateQuestion function to call the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionGenerationInputSchema = z.object({
  topic: z.string().describe('The coding topic for which to generate a question.'),
  difficulty: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The difficulty level of the question.'),
});
export type QuestionGenerationInput = z.infer<typeof QuestionGenerationInputSchema>;

const QuestionGenerationOutputSchema = z.object({
  question: z.string().describe('The generated coding or conceptual question.'),
  hint: z.string().describe('A concise, actionable hint for the generated question. It should guide the user without giving away the solution.'),
  questionType: z.enum(["coding", "conceptual"]).describe("The type of question generated, either a coding task or a conceptual query."),
});
export type QuestionGenerationOutput = z.infer<typeof QuestionGenerationOutputSchema>;

export async function generateQuestion(input: QuestionGenerationInput): Promise<QuestionGenerationOutput> {
  return generateQuestionFlow(input);
}

const generateQuestionPrompt = ai.definePrompt({
  name: 'generateQuestionPrompt',
  input: {schema: QuestionGenerationInputSchema},
  output: {schema: QuestionGenerationOutputSchema},
  prompt: `You are an AI expert in generating coding questions and conceptual questions, along with helpful hints for different skill levels.

  Based on the topic and difficulty level provided, generate:
  1. EITHER a specific coding question OR a conceptual question.
  2. A single, concise, actionable hint for that question. The hint should help the user identify a key concept, suggest a general approach, or point towards a relevant language feature or pitfall. For conceptual questions, the hint might point towards key areas to research or consider. **Crucially, the hint must not give away the direct solution or include any code snippets.** Focus on guiding the user's thinking process.
  3. Indicate whether the generated item is a "coding" question or a "conceptual" question by setting the questionType field appropriately.

  Topic: {{{topic}}}
  Difficulty: {{{difficulty}}}

  Provide the question, the hint, and the question type according to the output schema.
  `,
});

const generateQuestionFlow = ai.defineFlow(
  {
    name: 'generateQuestionFlow',
    inputSchema: QuestionGenerationInputSchema,
    outputSchema: QuestionGenerationOutputSchema,
  },
  async input => {
    const {output} = await generateQuestionPrompt(input);
    return output!;
  }
);
