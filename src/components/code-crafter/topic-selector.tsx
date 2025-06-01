
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookMarked, Check } from 'lucide-react';

interface TopicSelectorProps {
  currentTopic: string | null;
  onTopicChange: (topic: string) => void;
  disabled: boolean;
}

const PREDEFINED_TOPICS = [
  "JavaScript Variables", "Python Lists", "React Props", "CSS Selectors", "HTML Attributes",
  "JavaScript Functions", "Python Dictionaries", "React State Management", "CSS Grid Layout",
  "Data Structures: Arrays", "Algorithms: Bubble Sort",
];
const OTHER_TOPIC_VALUE = "__other__";

export const TopicSelector: FC<TopicSelectorProps> = ({
  currentTopic,
  onTopicChange,
  disabled,
}) => {
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customTopicDraft, setCustomTopicDraft] = useState<string>("");

  useEffect(() => {
    const initiallyCustom = !!currentTopic && !PREDEFINED_TOPICS.includes(currentTopic);
    setIsCustomMode(initiallyCustom);
    if (initiallyCustom) {
      setCustomTopicDraft(currentTopic || "");
    } else if (!currentTopic && !isCustomMode) { 
      // If topic is cleared externally (e.g. difficulty change) and we are not in custom mode, clear draft.
      setCustomTopicDraft("");
    }
    // If currentTopic is predefined, customTopicDraft will be cleared by handleSelectChange or this effect.
    // If user is actively typing in custom mode, this effect shouldn't overwrite their draft
    // unless currentTopic itself changes to something that forces non-custom mode or clears it.
  }, [currentTopic]);


  const handleSelectChange = (value: string) => {
    if (value === OTHER_TOPIC_VALUE) {
      setIsCustomMode(true);
      // Do not call onTopicChange here. User needs to type and confirm.
      // customTopicDraft retains its value if user was already typing.
    } else {
      setIsCustomMode(false);
      setCustomTopicDraft(""); // Clear draft when a predefined topic is selected
      onTopicChange(value); 
    }
  };

  const handleCustomInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTopicDraft(event.target.value);
    // Do NOT call onTopicChange here.
  };

  const handleConfirmCustomTopic = () => {
    if (customTopicDraft.trim()) {
      onTopicChange(customTopicDraft.trim());
    }
  };

  let dropdownDisplayValue: string | undefined;
  if (isCustomMode) {
    dropdownDisplayValue = OTHER_TOPIC_VALUE;
  } else if (currentTopic && PREDEFINED_TOPICS.includes(currentTopic)) {
    dropdownDisplayValue = currentTopic;
  } else {
    // Handles null currentTopic or if currentTopic is custom but isCustomMode is false (e.g., during transition)
    // This will show the placeholder in SelectValue
    dropdownDisplayValue = undefined; 
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <BookMarked className="mr-2 h-6 w-6 text-primary" /> Choose or Define a Topic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="topic-select" className="mb-1 block">Select a topic</Label>
          <Select
            value={dropdownDisplayValue}
            onValueChange={handleSelectChange}
            disabled={disabled}
            name="topic-select"
          >
            <SelectTrigger id="topic-select" aria-label="Select a topic" className="w-full">
              <SelectValue placeholder="Select or type a topic..." />
            </SelectTrigger>
            <SelectContent>
              {PREDEFINED_TOPICS.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
              <SelectItem value={OTHER_TOPIC_VALUE}>Other (Specify below)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isCustomMode && (
          <div className="animate-in fade-in-50 duration-300 space-y-2">
            <div>
              <Label htmlFor="custom-topic-input" className="mb-1 block">Enter your custom topic</Label>
              <Input
                id="custom-topic-input"
                type="text"
                placeholder="e.g., Advanced React Hooks"
                value={customTopicDraft}
                onChange={handleCustomInputChange}
                disabled={disabled}
                aria-label="Custom topic input"
                className="w-full"
              />
            </div>
            <Button
              onClick={handleConfirmCustomTopic}
              disabled={disabled || !customTopicDraft.trim()}
              className="w-full"
            >
              <Check className="mr-2 h-4 w-4" />
              Set Custom Topic
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
