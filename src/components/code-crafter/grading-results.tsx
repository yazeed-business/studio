"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Star, MessageSquare } from "lucide-react";
import type { GradeCodeOutput } from '@/ai/flows/code-grading';

interface GradingResultsProps {
  result: GradeCodeOutput | null;
  isLoading: boolean;
}

export const GradingResults: FC<GradingResultsProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
             <Star className="mr-2 h-6 w-6 text-primary" /> AI Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
       <Card className="shadow-lg border-dashed border-muted">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-muted-foreground flex items-center">
             <Star className="mr-2 h-6 w-6 text-muted-foreground" /> AI Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Submit your code to see the grading results.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg transition-all ${result.passed ? 'border-green-500' : 'border-red-500'}`}>
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Star className="mr-2 h-6 w-6 text-primary" /> AI Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold">Score: {result.score}/100</p>
            <Badge variant={result.passed ? "default" : "destructive"} className={result.passed ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
              {result.passed ? (
                <CheckCircle2 className="mr-1 h-4 w-4" />
              ) : (
                <XCircle className="mr-1 h-4 w-4" />
              )}
              {result.passed ? "Passed" : "Failed"}
            </Badge>
          </div>
        </div>
        <div>
          <h4 className="text-md font-semibold mb-1 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-accent"/>
            Feedback:
          </h4>
          <CardDescription className="text-base whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{result.feedback}</CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};
