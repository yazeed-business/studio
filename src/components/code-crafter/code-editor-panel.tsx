
"use client";

import type { FC, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, FileCode, Copy, Eraser, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Terminal } from 'lucide-react';

interface CodeEditorPanelProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onSubmit: () => void; // For AI Grading
  onRunCode: () => void; // For client-side execution
  isSubmitting: boolean; // For AI Grading
  isRunningCode: boolean; // For client-side execution
  disabled: boolean;
  executionOutput: string | null;
  executionError: string | null;
}

export const CodeEditorPanel: FC<CodeEditorPanelProps> = ({
  code,
  onCodeChange,
  onSubmit,
  onRunCode,
  isSubmitting,
  isRunningCode,
  disabled,
  executionOutput,
  executionError,
}) => {
  const { toast } = useToast();

  const handleCodeInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onCodeChange(event.target.value);
  };

  const handleCopyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code Copied!",
        description: "Your code has been copied to the clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy code: ", err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy code to clipboard.",
      });
    }
  };

  const handleClearCode = () => {
    onCodeChange("");
    toast({
      title: "Code Cleared",
      description: "The editor content has been cleared.",
    });
  };

  const isExecutionDisabled = disabled || isSubmitting || isRunningCode || !code.trim();

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card className="shadow-lg flex flex-col flex-grow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-xl flex items-center">
            <FileCode className="mr-2 h-6 w-6 text-primary" /> Code Editor
          </CardTitle>
          <TooltipProvider>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                    disabled={!code.trim() || disabled || isSubmitting || isRunningCode}
                    aria-label="Copy code"
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy Code</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearCode}
                    disabled={!code.trim() || disabled || isSubmitting || isRunningCode}
                    aria-label="Clear code"
                  >
                    <Eraser className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear Code</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <Textarea
            value={code}
            onChange={handleCodeInputChange}
            placeholder={disabled ? "Please select a difficulty and generate a challenge first." : "Write your JavaScript or TypeScript code here..."}
            className="h-full min-h-[200px] font-code text-sm resize-y flex-grow"
            disabled={disabled || isSubmitting || isRunningCode}
            aria-label="Code Editor for JavaScript or TypeScript"
          />
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button
            onClick={onRunCode}
            disabled={isExecutionDisabled}
            className="w-full sm:w-auto transition-all"
            variant="outline"
          >
            {isRunningCode ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isRunningCode ? "Running..." : "Run Code (JS/TS)"}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={disabled || isSubmitting || isRunningCode || !code.trim()}
            className="w-full sm:flex-grow transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Grading..." : "Submit for AI Grade"}
          </Button>
        </CardFooter>
      </Card>

      {(executionOutput || executionError) && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center">
              <Terminal className="mr-2 h-5 w-5 text-primary" /> Execution Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Runtime Error</AlertTitle>
                <AlertDescription className="font-code whitespace-pre-wrap">{executionError}</AlertDescription>
              </Alert>
            )}
            {executionOutput && !executionError && (
              <ScrollArea className="h-32 w-full rounded-md border p-3 bg-muted/50">
                <pre className="text-sm font-code whitespace-pre-wrap">{executionOutput}</pre>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
