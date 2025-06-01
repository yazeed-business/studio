"use client";

import { useState, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DifficultySelector } from "@/components/code-crafter/difficulty-selector";
import { ChallengeDisplay } from "@/components/code-crafter/challenge-display";
import { CodeEditorPanel } from "@/components/code-crafter/code-editor-panel";
import { GradingResults } from "@/components/code-crafter/grading-results";
import { useToast } from "@/hooks/use-toast";
import { generateTopic, type TopicGenerationInput, type TopicGenerationOutput } from "@/ai/flows/topic-generation";
import { generateQuestion, type QuestionGenerationInput, type QuestionGenerationOutput } from "@/ai/flows/question-generation";
import { gradeCode, type GradeCodeInput, type GradeCodeOutput } from "@/ai/flows/code-grading";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export default function CodeCrafterPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [gradingResult, setGradingResult] = useState<GradeCodeOutput | null>(null);

  const [isLoadingTopic, setIsLoadingTopic] = useState<boolean>(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const resetChallengeState = () => {
    setTopic(null);
    setQuestion(null);
    setCode("");
    setGradingResult(null);
    setError(null);
  };

  const handleDifficultyChange = useCallback(async (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    resetChallengeState();
    setIsLoadingTopic(true);

    try {
      const topicInput: TopicGenerationInput = { difficulty: newDifficulty };
      const topicOutput: TopicGenerationOutput = await generateTopic(topicInput);
      setTopic(topicOutput.topic);
      setIsLoadingTopic(false);
      
      setIsLoadingQuestion(true);
      try {
        const questionInput: QuestionGenerationInput = { topic: topicOutput.topic, difficulty: newDifficulty };
        const questionOutput: QuestionGenerationOutput = await generateQuestion(questionInput);
        setQuestion(questionOutput.question);
      } catch (questionError) {
        console.error("Error generating question:", questionError);
        setError("Failed to generate question. Please try again.");
        toast({ variant: "destructive", title: "Error", description: "Failed to generate question." });
      } finally {
        setIsLoadingQuestion(false);
      }
    } catch (topicError) {
      console.error("Error generating topic:", topicError);
      setError("Failed to generate topic. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to generate topic." });
      setIsLoadingTopic(false);
    }
  }, [toast]);

  const handleSubmitCode = async () => {
    if (!topic || !difficulty || !code.trim()) {
      setError("Missing information to grade code. Ensure topic, difficulty, and code are set.");
      toast({ variant: "destructive", title: "Error", description: "Cannot submit: Missing topic, difficulty, or code." });
      return;
    }

    setIsSubmittingCode(true);
    setGradingResult(null);
    setError(null);

    try {
      const gradingInput: GradeCodeInput = {
        code,
        topic,
        difficulty,
      };
      const result: GradeCodeOutput = await gradeCode(gradingInput);
      setGradingResult(result);
      toast({ title: "Grading Complete!", description: result.passed ? "Congratulations, you passed!" : "Keep practicing!", className: result.passed ? "bg-green-500 text-white" : "bg-red-500 text-white" });
    } catch (submissionError) {
      console.error("Error grading code:", submissionError);
      setError("Failed to grade code. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to grade your code." });
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const isEditorDisabled = !topic || !question || isLoadingTopic || isLoadingQuestion;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <DifficultySelector
          selectedDifficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          disabled={isLoadingTopic || isLoadingQuestion || isSubmittingCode}
        />

        {error && (
          <Alert variant="destructive" className="transition-all animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section aria-labelledby="challenge-heading">
            <h2 id="challenge-heading" className="sr-only">Challenge Details</h2>
            <ChallengeDisplay
              topic={topic}
              question={question}
              isLoadingTopic={isLoadingTopic}
              isLoadingQuestion={isLoadingQuestion}
            />
          </section>
          
          <div className="space-y-8">
            <section aria-labelledby="editor-heading">
              <h2 id="editor-heading" className="sr-only">Code Editor</h2>
              <CodeEditorPanel
                code={code}
                onCodeChange={setCode}
                onSubmit={handleSubmitCode}
                isSubmitting={isSubmittingCode}
                disabled={isEditorDisabled}
              />
            </section>
            
            <section aria-labelledby="feedback-heading">
              <h2 id="feedback-heading" className="sr-only">Grading Feedback</h2>
              <GradingResults result={gradingResult} isLoading={isSubmittingCode} />
            </section>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
