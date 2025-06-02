
"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { ChallengeDisplay } from "@/components/code-crafter/challenge-display";
import { CodeEditorPanel } from "@/components/code-crafter/code-editor-panel";
import { ConceptualAnswerPanel } from "@/components/code-crafter/conceptual-answer-panel";
import { GradingResults } from "@/components/code-crafter/grading-results";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateQuestion, type QuestionGenerationInput, type QuestionGenerationOutput } from "@/ai/flows/question-generation";
import { gradeCode, type GradeCodeInput, type GradeCodeOutput } from "@/ai/flows/code-grading";
import { gradeAnswer, type AnswerGradingInput, type AnswerGradingOutput } from "@/ai/flows/answer-grading";
import { generateSolution, type SolutionGenerationInput, type SolutionGenerationOutput } from "@/ai/flows/solution-generation";
import { AlertCircle, Code, MessageCircle, Home, RotateCcw, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type QuestionTypePreference = "coding" | "conceptual" | "both";
type ActiveDisplayType = "coding" | "conceptual";


function ChallengePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [initialDifficulty, setInitialDifficulty] = useState<Difficulty | null>(null);
  const [initialTopic, setInitialTopic] = useState<string | null>(null);
  const [initialPreference, setInitialPreference] = useState<QuestionTypePreference | null>(null);

  const [challengeData, setChallengeData] = useState<QuestionGenerationOutput | null>(null);
  const [activeDisplayType, setActiveDisplayType] = useState<ActiveDisplayType | null>(null);
  
  const [code, setCode] = useState<string>("");
  const [conceptualAnswer, setConceptualAnswer] = useState<string>("");
  
  const [gradingResult, setGradingResult] = useState<GradeCodeOutput | AnswerGradingOutput | null>(null);
  const [generatedSolution, setGeneratedSolution] = useState<SolutionGenerationOutput | null>(null);
  const [isLoadingSolution, setIsLoadingSolution] = useState<boolean>(false);
  const [solutionError, setSolutionError] = useState<string | null>(null);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasValidParams, setHasValidParams] = useState<boolean | null>(null);


  const resetChallengeState = useCallback(() => {
    setChallengeData(null);
    setActiveDisplayType(null);
    setCode("");
    setConceptualAnswer("");
    setGradingResult(null);
    setError(null);
    setGeneratedSolution(null);
    setIsLoadingSolution(false);
    setSolutionError(null);
  }, []);

  const fetchQuestionForChallenge = useCallback(async (
    currentTopic: string, 
    currentDifficulty: Difficulty, 
    currentPreference: QuestionTypePreference
  ) => {
    if (!currentTopic?.trim() || !currentDifficulty || !currentPreference) {
      resetChallengeState();
      return;
    }

    setIsLoadingQuestion(true);
    resetChallengeState(); 

    const preferredTypeForApi = currentPreference === "both" ? "any" : currentPreference;

    try {
      const questionInput: QuestionGenerationInput = { 
        topic: currentTopic, 
        difficulty: currentDifficulty, 
        preferredQuestionType: preferredTypeForApi 
      };
      const output: QuestionGenerationOutput = await generateQuestion(questionInput);
      setChallengeData(output);

      if (output.questionTypeGenerated === "coding") {
        setActiveDisplayType("coding");
        toast({ title: "Coding Challenge Ready!", description: `A coding question for ${currentTopic} (${currentDifficulty}) generated.`});
      } else if (output.questionTypeGenerated === "conceptual") {
        setActiveDisplayType("conceptual");
        toast({ title: "Conceptual Question Ready!", description: `A conceptual question for ${currentTopic} (${currentDifficulty}) generated.`});
      } else if (output.questionTypeGenerated === "both") {
        setActiveDisplayType("coding"); // Default to coding first
        toast({ title: "Challenges Ready!", description: `Coding and conceptual questions for ${currentTopic} (${currentDifficulty}) generated.`});
      }
    } catch (questionError) {
      console.error("Error generating question(s):", questionError);
      setError(`Failed to generate question(s) for "${currentTopic}". Please try again or return to the dashboard to select different parameters.`);
      toast({ variant: "destructive", title: "Question Generation Error", description: `Could not generate question(s) for "${currentTopic}".` });
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [toast, resetChallengeState]);

  useEffect(() => {
    const difficultyParam = searchParams.get("difficulty") as Difficulty | null;
    const topicParam = searchParams.get("topic");
    const typeParam = searchParams.get("type") as QuestionTypePreference | null;

    if (difficultyParam && topicParam && typeParam) {
      setInitialDifficulty(difficultyParam);
      setInitialTopic(topicParam);
      setInitialPreference(typeParam);
      setHasValidParams(true);
      fetchQuestionForChallenge(topicParam, difficultyParam, typeParam);
    } else {
      setHasValidParams(false);
      setError("Challenge parameters not found. Please configure your challenge from the dashboard.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  const currentDisplayedQuestion = useMemo(() => {
    if (!challengeData || !activeDisplayType) return null;
    return activeDisplayType === 'coding' ? challengeData.codingQuestion : challengeData.conceptualQuestion;
  }, [challengeData, activeDisplayType]);

  const currentDisplayedHint = useMemo(() => {
    if (!challengeData || !activeDisplayType) return null;
    return activeDisplayType === 'coding' ? challengeData.codingHint : challengeData.conceptualHint;
  }, [challengeData, activeDisplayType]);

  const handleSubmitChallenge = async () => {
    if (!initialTopic || !initialDifficulty || !activeDisplayType || !currentDisplayedQuestion) {
      setError("Missing information to grade. Ensure topic, difficulty, and question type are set.");
      toast({ variant: "destructive", title: "Error", description: "Cannot submit: Missing critical information." });
      return;
    }

    if (activeDisplayType === "coding" && !code.trim()) {
      setError("Code editor is empty. Please write your code before submitting.");
      toast({ variant: "destructive", title: "Error", description: "Cannot submit: Code is empty." });
      return;
    }

    if (activeDisplayType === "conceptual" && !conceptualAnswer.trim()) {
      setError("Answer field is empty. Please write your answer before submitting.");
      toast({ variant: "destructive", title: "Error", description: "Cannot submit: Answer is empty." });
      return;
    }

    setIsSubmittingChallenge(true);
    setGradingResult(null);
    setGeneratedSolution(null); // Clear previous solution on new submission
    setSolutionError(null);
    setError(null);

    try {
      let result: GradeCodeOutput | AnswerGradingOutput;
      if (activeDisplayType === "coding") {
        const gradingInput: GradeCodeInput = { code, topic: initialTopic, difficulty: initialDifficulty };
        result = await gradeCode(gradingInput);
      } else { // conceptual
        const gradingInput: AnswerGradingInput = { userAnswer: conceptualAnswer, question: currentDisplayedQuestion, topic: initialTopic, difficulty: initialDifficulty };
        result = await gradeAnswer(gradingInput);
      }
      setGradingResult(result);
      toast({ title: "Grading Complete!", description: result.passed ? "Congratulations, you passed!" : "Keep practicing!", className: result.passed ? "bg-green-500 text-white" : "bg-red-500 text-white" });
    } catch (submissionError) {
      console.error(`Error grading ${activeDisplayType} challenge:`, submissionError);
      setError(`Failed to grade ${activeDisplayType} challenge. Please try again.`);
      toast({ variant: "destructive", title: "Error", description: `Failed to grade your ${activeDisplayType} challenge.` });
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  const handleShowSolution = async () => {
    if (!initialTopic || !initialDifficulty || !activeDisplayType || !currentDisplayedQuestion) {
      setSolutionError("Cannot generate solution: Missing challenge details.");
      toast({ variant: "destructive", title: "Error", description: "Missing challenge details for solution."});
      return;
    }
    setIsLoadingSolution(true);
    setSolutionError(null);
    setGeneratedSolution(null);
    try {
      const solutionInput: SolutionGenerationInput = {
        topic: initialTopic,
        difficulty: initialDifficulty,
        question: currentDisplayedQuestion,
        questionType: activeDisplayType,
      };
      const solutionOutput = await generateSolution(solutionInput);
      setGeneratedSolution(solutionOutput);
      toast({ title: "Solution Generated", description: "The solution is now available below."});
    } catch (err) {
      console.error("Error generating solution:", err);
      setSolutionError("Failed to generate solution. Please try again.");
      toast({ variant: "destructive", title: "Solution Error", description: "Could not generate the solution."});
    } finally {
      setIsLoadingSolution(false);
    }
  };

  const handleRestartChallenge = () => {
    if (initialTopic && initialDifficulty && initialPreference) {
      fetchQuestionForChallenge(initialTopic, initialDifficulty, initialPreference);
    }
  };
  
  const isInputDisabled = !initialTopic?.trim() || !currentDisplayedQuestion || isLoadingQuestion || isSubmittingChallenge || isLoadingSolution;
  const isSelectorDisabled = isLoadingQuestion || isSubmittingChallenge || isLoadingSolution;

  if (hasValidParams === null) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <AppFooter />
      </div>
    );
  }
  
  if (!hasValidParams) {
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
              {error || "Challenge parameters are missing. Please return to the dashboard to set up your challenge."}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/')} className="mt-6">
            <Home className="mr-2 h-4 w-4" /> Go to Dashboard
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
           <h1 className="text-2xl font-headline">Your Challenge</h1>
           <div className="flex gap-2">
            <Button onClick={handleRestartChallenge} variant="outline" disabled={isSelectorDisabled}>
              <RotateCcw className="mr-2 h-4 w-4" /> Restart This Challenge
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" disabled={isSelectorDisabled && !isLoadingQuestion}>
              <Home className="mr-2 h-4 w-4" /> New Challenge (Dashboard)
            </Button>
           </div>
        </div>

        {error && !isLoadingQuestion && (
          <Alert variant="destructive" className="transition-all animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {challengeData?.questionTypeGenerated === 'both' && (
          <div className="flex justify-center gap-4 my-4">
            <Button
              variant={activeDisplayType === 'coding' ? 'default' : 'outline'}
              onClick={() => { setGradingResult(null); setGeneratedSolution(null); setActiveDisplayType('coding'); }}
              disabled={isSelectorDisabled}
            >
              <Code className="mr-2 h-4 w-4" />
              Coding Challenge
            </Button>
            <Button
              variant={activeDisplayType === 'conceptual' ? 'default' : 'outline'}
              onClick={() => { setGradingResult(null); setGeneratedSolution(null); setActiveDisplayType('conceptual');}}
              disabled={isSelectorDisabled}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Conceptual Question
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section aria-labelledby="challenge-heading">
            <h2 id="challenge-heading" className="sr-only">Challenge Details</h2>
            <ChallengeDisplay
              topic={initialTopic}
              question={currentDisplayedQuestion}
              questionType={activeDisplayType} 
              isLoadingQuestion={isLoadingQuestion}
              questionHint={currentDisplayedHint}
              isQuestionAvailable={!!currentDisplayedQuestion && !!initialTopic && !!initialDifficulty}
            />
          </section>
          
          <div className="space-y-8">
            {activeDisplayType === "coding" && challengeData && (challengeData.codingQuestion || isLoadingQuestion) && (
              <section aria-labelledby="editor-heading">
                <h2 id="editor-heading" className="sr-only">Code Editor</h2>
                <CodeEditorPanel
                  code={code}
                  onCodeChange={setCode}
                  onSubmit={handleSubmitChallenge}
                  isSubmitting={isSubmittingChallenge}
                  disabled={isInputDisabled || !challengeData?.codingQuestion}
                />
              </section>
            )}

            {activeDisplayType === "conceptual" && challengeData && (challengeData.conceptualQuestion || isLoadingQuestion) && (
               <section aria-labelledby="answer-heading">
                <h2 id="answer-heading" className="sr-only">Conceptual Answer</h2>
                <ConceptualAnswerPanel
                  answer={conceptualAnswer}
                  onAnswerChange={setConceptualAnswer}
                  onSubmit={handleSubmitChallenge}
                  isSubmitting={isSubmittingChallenge}
                  disabled={isInputDisabled || !challengeData?.conceptualQuestion}
                />
              </section>
            )}
            
            {activeDisplayType && challengeData && (currentDisplayedQuestion || isLoadingQuestion) && (
              <section aria-labelledby="feedback-heading">
                <h2 id="feedback-heading" className="sr-only">Grading Feedback</h2>
                <GradingResults
                  result={gradingResult}
                  isLoading={isSubmittingChallenge}
                  onShowSolution={handleShowSolution}
                  generatedSolution={generatedSolution}
                  isLoadingSolution={isLoadingSolution}
                  solutionError={solutionError}
                  question={currentDisplayedQuestion} // Needed for solution generation context
                  topic={initialTopic} // Needed for solution generation context
                  difficulty={initialDifficulty} // Needed for solution generation context
                  questionType={activeDisplayType} // Needed for solution generation context
                />
              </section>
            )}
             {!currentDisplayedQuestion && !isLoadingQuestion && initialTopic && (
                <div className="text-center py-10">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg text-muted-foreground">Generating your challenge for {initialTopic}...</p>
                </div>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <AppFooter />
      </div>
    }>
      <ChallengePageContent />
    </Suspense>
  )
}
