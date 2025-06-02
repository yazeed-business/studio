
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DifficultySelector } from "@/components/code-crafter/difficulty-selector";
import { TopicSelector } from "@/components/code-crafter/topic-selector";
import { QuestionTypeSelector, type QuestionTypePreference } from "@/components/code-crafter/question-type-selector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export default function DashboardPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionTypePreference, setQuestionTypePreference] = useState<QuestionTypePreference>("both");
  
  const router = useRouter();
  const { toast } = useToast();

  const handleStartChallenge = useCallback(() => {
    if (!difficulty || !selectedTopic?.trim() || !questionTypePreference) {
      toast({
        variant: "destructive",
        title: "Missing Selections",
        description: "Please select a difficulty, topic, and question type preference before starting.",
      });
      return;
    }

    const queryParams = new URLSearchParams({
      difficulty,
      topic: selectedTopic,
      type: questionTypePreference,
    });

    router.push(`/challenge?${queryParams.toString()}`);
  }, [difficulty, selectedTopic, questionTypePreference, router, toast]);

  const isFormIncomplete = !difficulty || !selectedTopic?.trim() || !questionTypePreference;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Welcome to CodeCrafter!</CardTitle>
            <CardDescription className="text-lg">
              Configure your learning challenge below and put your skills to the test.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6">
              <DifficultySelector
                selectedDifficulty={difficulty}
                onDifficultyChange={setDifficulty}
                disabled={false} 
              />
              <TopicSelector
                currentTopic={selectedTopic}
                onTopicChange={setSelectedTopic}
                disabled={false}
              />
              <QuestionTypeSelector
                selectedPreference={questionTypePreference}
                onPreferenceChange={setQuestionTypePreference}
                disabled={false}
              />
            </div>
            <Button
              onClick={handleStartChallenge}
              disabled={isFormIncomplete}
              className="w-full text-lg py-6 mt-4"
              size="lg"
            >
              Start Challenge <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
             {isFormIncomplete && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please fill in all options to start your challenge.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
