
"use client";

import { useState, useCallback } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DifficultySelector } from "@/components/code-crafter/difficulty-selector";
import { TopicSelector } from "@/components/code-crafter/topic-selector";
import { ChallengeDisplay } from "@/components/code-crafter/challenge-display";
import { CodeEditorPanel } from "@/components/code-crafter/code-editor-panel";
import { GradingResults } from "@/components/code-crafter/grading-results";
import { useToast } from "@/hooks/use-toast";
import { generateQuestion, type QuestionGenerationInput, type QuestionGenerationOutput } from "@/ai/flows/question-generation";
import { gradeCode, type GradeCodeInput, type GradeCodeOutput } from "@/ai/flows/code-grading";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export default function CodeCrafterPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [gradingResult, setGradingResult] = useState<GradeCodeOutput | null>(null);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const { toast } = useToast();

  const resetQuestionAndRelatedState = useCallback(() => {
    setQuestion(null);
    setCurrentHint(null);
    setCode("");
    setGradingResult(null);
    setError(null);
  }, []);

  const fetchQuestionForChallenge = useCallback(async (currentTopic: string, currentDifficulty: Difficulty) => {
    if (!currentTopic?.trim() || !currentDifficulty) {
      setQuestion(null);
      setCurrentHint(null); 
      return;
    }

    setIsLoadingQuestion(true);
    setError(null); 
    setQuestion(null);
    setCurrentHint(null);
    setCode(""); 
    setGradingResult(null); 

    try {
      const questionInput: QuestionGenerationInput = { topic: currentTopic, difficulty: currentDifficulty };
      const questionOutput: QuestionGenerationOutput = await generateQuestion(questionInput);
      setQuestion(questionOutput.question);
      setCurrentHint(questionOutput.hint);
      toast({ title: "New Challenge Ready!", description: `Question for ${currentTopic} (${currentDifficulty}) generated.`});
    } catch (questionError) {
      console.error("Error generating question:", questionError);
      setError(`Failed to generate question for "${currentTopic}". Please try a different topic/difficulty or try again.`);
      toast({ variant: "destructive", title: "Question Generation Error", description: `Could not generate a question for "${currentTopic}".` });
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [toast]);

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    resetQuestionAndRelatedState();
    if (selectedTopic && newDifficulty) {
      fetchQuestionForChallenge(selectedTopic, newDifficulty);
    }
  }, [selectedTopic, fetchQuestionForChallenge, resetQuestionAndRelatedState]);

  const handleTopicChange = useCallback((newTopic: string) => {
    setSelectedTopic(newTopic);
    resetQuestionAndRelatedState();
    if (newTopic?.trim() && difficulty) {
      fetchQuestionForChallenge(newTopic, difficulty);
    } else if (!newTopic?.trim()){
      setQuestion(null); 
      setCurrentHint(null);
    }
  }, [difficulty, fetchQuestionForChallenge, resetQuestionAndRelatedState]);

  const handleSubmitCode = async () => {
    if (!selectedTopic || !difficulty || !code.trim()) {
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
        topic: selectedTopic,
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
  

  const isEditorDisabled = !selectedTopic?.trim() || !question || isLoadingQuestion || isSubmittingCode;
  const isSelectorDisabled = isLoadingQuestion || isSubmittingCode;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DifficultySelector
            selectedDifficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            disabled={isSelectorDisabled}
          />
          <TopicSelector
            currentTopic={selectedTopic}
            onTopicChange={handleTopicChange}
            disabled={isSelectorDisabled}
          />
        </div>

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
              topic={selectedTopic}
              question={question}
              isLoadingQuestion={isLoadingQuestion}
              questionHint={currentHint}
              isQuestionAvailable={!!question && !!selectedTopic && !!difficulty}
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
