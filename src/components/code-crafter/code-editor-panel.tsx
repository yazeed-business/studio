"use client";

import type { FC, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, FileCode } from "lucide-react";

interface CodeEditorPanelProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export const CodeEditorPanel: FC<CodeEditorPanelProps> = ({
  code,
  onCodeChange,
  onSubmit,
  isSubmitting,
  disabled,
}) => {
  const handleCodeInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onCodeChange(event.target.value);
  };

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <FileCode className="mr-2 h-6 w-6 text-primary" /> Code Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          value={code}
          onChange={handleCodeInputChange}
          placeholder={disabled ? "Please select a difficulty and generate a challenge first." : "Write your code here..."}
          className="h-full min-h-[200px] font-code text-sm resize-none"
          disabled={disabled || isSubmitting}
          aria-label="Code Editor"
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSubmit}
          disabled={disabled || isSubmitting || !code.trim()}
          className="w-full transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? "Grading..." : "Submit Code"}
        </Button>
      </CardFooter>
    </Card>
  );
};
