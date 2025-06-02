
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, HelpCircle } from "lucide-react";

interface ChallengeDisplayProps {
  topic: string | null;
  question: string | null;
  isLoadingQuestion: boolean;
  questionHint: string | null;
  isQuestionAvailable: boolean;
}

export const ChallengeDisplay: FC<ChallengeDisplayProps> = ({
  topic,
  question,
  isLoadingQuestion,
  questionHint,
  isQuestionAvailable,
}) => {
  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Lightbulb className="mr-2 h-6 w-6 text-primary" /> Your Coding Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
             <HelpCircle className="mr-2 h-5 w-5 text-accent" /> Topic:
          </h3>
          {topic ? (
            <CardDescription className="text-base">{topic}</CardDescription>
          ) : (
            <CardDescription className="text-base text-muted-foreground">Select a difficulty and topic to generate a challenge.</CardDescription>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <HelpCircle className="mr-2 h-5 w-5 text-accent" /> Question:
          </h3>
          {isLoadingQuestion ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          ) : question ? (
            <CardDescription className="text-base whitespace-pre-wrap">{question}</CardDescription>
          ) : topic && topic.trim() ? ( 
             <CardDescription className="text-base text-muted-foreground">Generating question for "{topic}"... (Select difficulty if not done)</CardDescription>
          ) : (
            <CardDescription className="text-base text-muted-foreground">Select a topic and difficulty level first.</CardDescription>
          )}
        </div>

        {isQuestionAvailable && questionHint && (
          <div className="mt-4 pt-4 border-t border-border">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="hint">
                <AccordionTrigger className="text-accent hover:text-accent/90 font-semibold text-base">
                  <Lightbulb className="mr-2 h-5 w-5" /> Show Hint
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
                  {questionHint}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
