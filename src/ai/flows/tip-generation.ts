'use server';
/**
 * @fileOverview A hint generation AI agent.
 *
 * - generateHint - A function that handles hint generation.
 * - GenerateHintInput - The input type for the generateHint function.
 * - GenerateHintOutput - The return type for the generateHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHintInputSchema = z.object({
  question: z.string().describe('The coding question for which to generate a hint.'),
  topic: z.string().describe('The topic of the coding question.'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of the question.'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('A helpful hint for the coding question.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const hintPrompt = ai.definePrompt({
  name: 'hintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are an expert AI programming tutor. For the given coding challenge, provide a *single, concise, actionable hint*.
The hint should help the user identify a key concept, suggest a general approach, or point towards a relevant language feature or pitfall.
**Crucially, the hint must not give away the direct solution or include any code snippets.**
Focus on guiding the user's thinking process and problem-solving strategy.

Question: "{{{question}}}"
Topic: "{{{topic}}}"
Difficulty: "{{{difficulty}}}"

Hint:`,
});

const generateHintFlow = ai.defineFlow(
  {
    name: 'generateHintFlow',
    inputSchema: GenerateHintInputSchema,
    outputSchema: GenerateHintOutputSchema,
  },
  async input => {
    const {output} = await hintPrompt(input);
    return output!;
  }
);
