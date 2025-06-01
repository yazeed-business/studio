'use server';

/**
 * @fileOverview Question generation flow.
 *
 * This file defines a Genkit flow that generates a coding question based on a specified topic.
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
  question: z.string().describe('The generated coding question.'),
});
export type QuestionGenerationOutput = z.infer<typeof QuestionGenerationOutputSchema>;

export async function generateQuestion(input: QuestionGenerationInput): Promise<QuestionGenerationOutput> {
  return generateQuestionFlow(input);
}

const generateQuestionPrompt = ai.definePrompt({
  name: 'generateQuestionPrompt',
  input: {schema: QuestionGenerationInputSchema},
  output: {schema: QuestionGenerationOutputSchema},
  prompt: `You are an AI expert in generating coding questions for different skill levels.

  Based on the topic and difficulty level provided, generate a coding question.

  Topic: {{{topic}}}
  Difficulty: {{{difficulty}}}

  Question:`, // The LLM will generate the question here
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
