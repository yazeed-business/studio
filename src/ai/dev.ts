import { config } from 'dotenv';
config();

import '@/ai/flows/question-generation.ts';
import '@/ai/flows/code-grading.ts';
import '@/ai/flows/topic-generation.ts';