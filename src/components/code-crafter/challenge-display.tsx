
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, HelpCircle } from "lucide-react";

interface ChallengeDisplayProps {
  topic: string | null;
  question: string | null;
  isLoadingQuestion: boolean;
  hint: string | null;
  isLoadingHint: boolean;
  hintError: string | null;
  onGetHint: () => void;
  isQuestionAvailable: boolean;
}

export const ChallengeDisplay: FC<ChallengeDisplayProps> = ({
  topic,
  question,
  isLoadingQuestion,
  hint,
  isLoadingHint,
  hintError,
  onGetHint,
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

        {isQuestionAvailable && (
          <div className="mt-4 pt-4 border-t border-border">
            {isLoadingHint ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-24 mb-2" /> 
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ) : hint ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="hint">
                  <AccordionTrigger className="text-accent hover:text-accent/90 font-semibold text-base">
                    <Lightbulb className="mr-2 h-5 w-5" /> Show Hint
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
                    {hint}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onGetHint}
                disabled={isLoadingHint || !isQuestionAvailable} 
                className="transition-all"
              >
                <Lightbulb className="mr-2 h-4 w-4" /> Get a Hint
              </Button>
            )}
            {hintError && !isLoadingHint && !hint && (
              <p className="mt-2 text-sm text-destructive">{hintError}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
