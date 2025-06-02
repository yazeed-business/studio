
"use client";

import { useState, useCallback, useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DifficultySelector } from "@/components/code-crafter/difficulty-selector";
import { TopicSelector } from "@/components/code-crafter/topic-selector";
import { ChallengeDisplay } from "@/components/code-crafter/challenge-display";
import { QuestionTypeSelector, type QuestionTypePreference } from "@/components/code-crafter/question-type-selector";
import { CodeEditorPanel } from "@/components/code-crafter/code-editor-panel";
import { ConceptualAnswerPanel } from "@/components/code-crafter/conceptual-answer-panel";
import { GradingResults } from "@/components/code-crafter/grading-results";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateQuestion, type QuestionGenerationInput, type QuestionGenerationOutput } from "@/ai/flows/question-generation";
import { gradeCode, type GradeCodeInput, type GradeCodeOutput } from "@/ai/flows/code-grading";
import { gradeAnswer, type AnswerGradingInput, type AnswerGradingOutput } from "@/ai/flows/answer-grading";
import { AlertCircle, Code, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type ActiveDisplayType = "coding" | "conceptual";

export default function CodeCrafterPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionTypePreference, setQuestionTypePreference] = useState<QuestionTypePreference>("both");
  
  const [challengeData, setChallengeData] = useState<QuestionGenerationOutput | null>(null);
  const [activeDisplayType, setActiveDisplayType] = useState<ActiveDisplayType | null>(null);
  
  const [code, setCode] = useState<string>("");
  const [conceptualAnswer, setConceptualAnswer] = useState<string>("");
  
  const [gradingResult, setGradingResult] = useState<GradeCodeOutput | AnswerGradingOutput | null>(null);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const resetQuestionAndRelatedState = useCallback(() => {
    setChallengeData(null);
    setActiveDisplayType(null);
    setCode("");
    setConceptualAnswer("");
    setGradingResult(null);
    setError(null);
  }, []);

  const fetchQuestionForChallenge = useCallback(async (
    currentTopic: string, 
    currentDifficulty: Difficulty, 
    currentPreference: QuestionTypePreference
  ) => {
    if (!currentTopic?.trim() || !currentDifficulty || !currentPreference) {
      resetQuestionAndRelatedState();
      return;
    }

    setIsLoadingQuestion(true);
    resetQuestionAndRelatedState(); 

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
        toast({ title: "New Coding Challenge Ready!", description: `A coding question for ${currentTopic} (${currentDifficulty}) generated.`});
      } else if (output.questionTypeGenerated === "conceptual") {
        setActiveDisplayType("conceptual");
        toast({ title: "New Conceptual Question Ready!", description: `A conceptual question for ${currentTopic} (${currentDifficulty}) generated.`});
      } else if (output.questionTypeGenerated === "both") {
        setActiveDisplayType("coding"); // Default to coding first
        toast({ title: "New Challenges Ready!", description: `Coding and conceptual questions for ${currentTopic} (${currentDifficulty}) generated.`});
      }

    } catch (questionError) {
      console.error("Error generating question(s):", questionError);
      setError(`Failed to generate question(s) for "${currentTopic}". Please try a different topic/difficulty or try again.`);
      toast({ variant: "destructive", title: "Question Generation Error", description: `Could not generate question(s) for "${currentTopic}".` });
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [toast, resetQuestionAndRelatedState]);

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    // resetQuestionAndRelatedState(); // fetchQuestion will reset
    if (selectedTopic && newDifficulty && questionTypePreference) {
      fetchQuestionForChallenge(selectedTopic, newDifficulty, questionTypePreference);
    } else {
      resetQuestionAndRelatedState();
    }
  }, [selectedTopic, questionTypePreference, fetchQuestionForChallenge, resetQuestionAndRelatedState]);

  const handleTopicChange = useCallback((newTopic: string) => {
    setSelectedTopic(newTopic);
    // resetQuestionAndRelatedState(); // fetchQuestion will reset
    if (newTopic?.trim() && difficulty && questionTypePreference) {
      fetchQuestionForChallenge(newTopic, difficulty, questionTypePreference);
    } else if (!newTopic?.trim()){
      resetQuestionAndRelatedState();
    }
  }, [difficulty, questionTypePreference, fetchQuestionForChallenge, resetQuestionAndRelatedState]);

  const handleQuestionTypePreferenceChange = useCallback((newPreference: QuestionTypePreference) => {
    setQuestionTypePreference(newPreference);
    // resetQuestionAndRelatedState(); // fetchQuestion will reset
    if (selectedTopic && difficulty && newPreference) {
      fetchQuestionForChallenge(selectedTopic, difficulty, newPreference);
    } else {
      resetQuestionAndRelatedState();
    }
  }, [selectedTopic, difficulty, fetchQuestionForChallenge, resetQuestionAndRelatedState]);

  const currentDisplayedQuestion = useMemo(() => {
    if (!challengeData || !activeDisplayType) return null;
    return activeDisplayType === 'coding' ? challengeData.codingQuestion : challengeData.conceptualQuestion;
  }, [challengeData, activeDisplayType]);

  const currentDisplayedHint = useMemo(() => {
    if (!challengeData || !activeDisplayType) return null;
    return activeDisplayType === 'coding' ? challengeData.codingHint : challengeData.conceptualHint;
  }, [challengeData, activeDisplayType]);


  const handleSubmitChallenge = async () => {
    if (!selectedTopic || !difficulty || !activeDisplayType || !currentDisplayedQuestion) {
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
    setError(null);

    try {
      let result: GradeCodeOutput | AnswerGradingOutput;
      if (activeDisplayType === "coding") {
        const gradingInput: GradeCodeInput = { code, topic: selectedTopic, difficulty };
        result = await gradeCode(gradingInput);
      } else { // conceptual
        const gradingInput: AnswerGradingInput = { userAnswer: conceptualAnswer, question: currentDisplayedQuestion, topic: selectedTopic, difficulty };
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
  
  const isInputDisabled = !selectedTopic?.trim() || !currentDisplayedQuestion || isLoadingQuestion || isSubmittingChallenge;
  const isSelectorDisabled = isLoadingQuestion || isSubmittingChallenge;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <QuestionTypeSelector
            selectedPreference={questionTypePreference}
            onPreferenceChange={handleQuestionTypePreferenceChange}
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
        
        {challengeData?.questionTypeGenerated === 'both' && (
          <div className="flex justify-center gap-4 my-4">
            <Button
              variant={activeDisplayType === 'coding' ? 'default' : 'outline'}
              onClick={() => setActiveDisplayType('coding')}
              disabled={isLoadingQuestion || isSubmittingChallenge}
            >
              <Code className="mr-2 h-4 w-4" />
              Coding Challenge
            </Button>
            <Button
              variant={activeDisplayType === 'conceptual' ? 'default' : 'outline'}
              onClick={() => setActiveDisplayType('conceptual')}
              disabled={isLoadingQuestion || isSubmittingChallenge}
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
              topic={selectedTopic}
              question={currentDisplayedQuestion}
              questionType={activeDisplayType} 
              isLoadingQuestion={isLoadingQuestion}
              questionHint={currentDisplayedHint}
              isQuestionAvailable={!!currentDisplayedQuestion && !!selectedTopic && !!difficulty}
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
            
            {activeDisplayType && challengeData && (
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
