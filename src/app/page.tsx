
"use client";

import { useState, useCallback } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DifficultySelector } from "@/components/code-crafter/difficulty-selector";
import { TopicSelector } from "@/components/code-crafter/topic-selector";
import { ChallengeDisplay } from "@/components/code-crafter/challenge-display";
import { CodeEditorPanel } from "@/components/code-crafter/code-editor-panel";
import { ConceptualAnswerPanel } from "@/components/code-crafter/conceptual-answer-panel";
import { GradingResults } from "@/components/code-crafter/grading-results";
import { useToast } from "@/hooks/use-toast";
import { generateQuestion, type QuestionGenerationInput, type QuestionGenerationOutput } from "@/ai/flows/question-generation";
import { gradeCode, type GradeCodeInput, type GradeCodeOutput } from "@/ai/flows/code-grading";
import { gradeAnswer, type AnswerGradingInput, type AnswerGradingOutput } from "@/ai/flows/answer-grading";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type QuestionType = "coding" | "conceptual" | null;

export default function CodeCrafterPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  const [question, setQuestion] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  
  const [code, setCode] = useState<string>("");
  const [conceptualAnswer, setConceptualAnswer] = useState<string>("");
  
  const [gradingResult, setGradingResult] = useState<GradeCodeOutput | AnswerGradingOutput | null>(null);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const resetQuestionAndRelatedState = useCallback(() => {
    setQuestion(null);
    setCurrentHint(null);
    setQuestionType(null);
    setCode("");
    setConceptualAnswer("");
    setGradingResult(null);
    setError(null);
  }, []);

  const fetchQuestionForChallenge = useCallback(async (currentTopic: string, currentDifficulty: Difficulty) => {
    if (!currentTopic?.trim() || !currentDifficulty) {
      resetQuestionAndRelatedState();
      return;
    }

    setIsLoadingQuestion(true);
    resetQuestionAndRelatedState(); // Clear previous question state first

    try {
      const questionInput: QuestionGenerationInput = { topic: currentTopic, difficulty: currentDifficulty };
      const questionOutput: QuestionGenerationOutput = await generateQuestion(questionInput);
      setQuestion(questionOutput.question);
      setCurrentHint(questionOutput.hint);
      setQuestionType(questionOutput.questionType);
      toast({ title: "New Challenge Ready!", description: `A ${questionOutput.questionType} question for ${currentTopic} (${currentDifficulty}) generated.`});
    } catch (questionError) {
      console.error("Error generating question:", questionError);
      setError(`Failed to generate question for "${currentTopic}". Please try a different topic/difficulty or try again.`);
      toast({ variant: "destructive", title: "Question Generation Error", description: `Could not generate a question for "${currentTopic}".` });
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [toast, resetQuestionAndRelatedState]);

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
      resetQuestionAndRelatedState();
    }
  }, [difficulty, fetchQuestionForChallenge, resetQuestionAndRelatedState]);

  const handleSubmitChallenge = async () => {
    if (!selectedTopic || !difficulty || !question || !questionType) {
      setError("Missing information to grade. Ensure topic, difficulty, and question type are set.");
      toast({ variant: "destructive", title: "Error", description: "Cannot submit: Missing critical information." });
      return;
    }

    if (questionType === "coding" && !code.trim()) {
      setError("Code editor is empty. Please write your code before submitting.");
      toast({ variant: "destructive", title: "Error", description: "Cannot submit: Code is empty." });
      return;
    }

    if (questionType === "conceptual" && !conceptualAnswer.trim()) {
      setError("Answer field is empty. Please write your answer before submitting.");
      toast({ variant: "destructive", title: "Error", description: "Cannot submit: Answer is empty." });
      return;
    }

    setIsSubmittingChallenge(true);
    setGradingResult(null);
    setError(null);

    try {
      let result: GradeCodeOutput | AnswerGradingOutput;
      if (questionType === "coding") {
        const gradingInput: GradeCodeInput = { code, topic: selectedTopic, difficulty };
        result = await gradeCode(gradingInput);
      } else { // conceptual
        const gradingInput: AnswerGradingInput = { userAnswer: conceptualAnswer, question, topic: selectedTopic, difficulty };
        result = await gradeAnswer(gradingInput);
      }
      setGradingResult(result);
      toast({ title: "Grading Complete!", description: result.passed ? "Congratulations, you passed!" : "Keep practicing!", className: result.passed ? "bg-green-500 text-white" : "bg-red-500 text-white" });
    } catch (submissionError) {
      console.error(`Error grading ${questionType} challenge:`, submissionError);
      setError(`Failed to grade ${questionType} challenge. Please try again.`);
      toast({ variant: "destructive", title: "Error", description: `Failed to grade your ${questionType} challenge.` });
    } finally {
      setIsSubmittingChallenge(false);
    }
  };
  
  const isInputDisabled = !selectedTopic?.trim() || !question || isLoadingQuestion || isSubmittingChallenge;
  const isSelectorDisabled = isLoadingQuestion || isSubmittingChallenge;

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
              questionType={questionType}
              isLoadingQuestion={isLoadingQuestion}
              questionHint={currentHint}
              isQuestionAvailable={!!question && !!selectedTopic && !!difficulty}
            />
          </section>
          
          <div className="space-y-8">
            {questionType === "coding" && (
              <section aria-labelledby="editor-heading">
                <h2 id="editor-heading" className="sr-only">Code Editor</h2>
                <CodeEditorPanel
                  code={code}
                  onCodeChange={setCode}
                  onSubmit={handleSubmitChallenge}
                  isSubmitting={isSubmittingChallenge}
                  disabled={isInputDisabled}
                />
              </section>
            )}

            {questionType === "conceptual" && (
               <section aria-labelledby="answer-heading">
                <h2 id="answer-heading" className="sr-only">Conceptual Answer</h2>
                <ConceptualAnswerPanel
                  answer={conceptualAnswer}
                  onAnswerChange={setConceptualAnswer}
                  onSubmit={handleSubmitChallenge}
                  isSubmitting={isSubmittingChallenge}
                  disabled={isInputDisabled}
                />
              </section>
            )}
            
            {(questionType === "coding" || questionType === "conceptual") && (
              <section aria-labelledby="feedback-heading">
                <h2 id="feedback-heading" className="sr-only">Grading Feedback</h2>
                <GradingResults result={gradingResult} isLoading={isSubmittingChallenge} />
              </section>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
