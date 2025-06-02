
'use server';

/**
 * @fileOverview Question generation flow.
 *
 * This file defines a Genkit flow that generates a coding or conceptual question and a corresponding hint
 * based on a specified topic, difficulty, and preferred question type.
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
  preferredQuestionType: z.enum(["coding", "conceptual", "any"]).describe("The user's preferred type of question. 'any' means the AI can choose or alternate.")
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

  User's preferred question type: {{{preferredQuestionType}}}
  If preferredQuestionType is 'coding', you MUST generate a coding question.
  If preferredQuestionType is 'conceptual', you MUST generate a conceptual question.
  If preferredQuestionType is 'any', you may choose to generate EITHER a coding OR a conceptual question relevant to the topic and difficulty.

  Based on the topic, difficulty, and the preferred question type, generate:
  1. A specific coding question OR a conceptual question that aligns with the user's preference.
  2. A single, concise, actionable hint for that question. The hint should help the user identify a key concept, suggest a general approach, or point towards a relevant language feature or pitfall. For conceptual questions, the hint might point towards key areas to research or consider. **Crucially, the hint must not give away the direct solution or include any code snippets.** Focus on guiding the user's thinking process.
  3. Indicate whether the generated item is a "coding" question or a "conceptual" question by setting the questionType field appropriately.

  Topic: {{{topic}}}
  Difficulty: {{{difficulty}}}

  Provide the question, the hint, and the actual question type generated (coding or conceptual) according to the output schema.
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
