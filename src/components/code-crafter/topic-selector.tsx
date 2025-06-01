
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
import { BookMarked } from 'lucide-react';

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
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => 
    !!currentTopic && !PREDEFINED_TOPICS.includes(currentTopic)
  );

  useEffect(() => {
    setIsCustomMode(!!currentTopic && !PREDEFINED_TOPICS.includes(currentTopic));
  }, [currentTopic]);

  const handleSelectChange = (value: string) => {
    if (value === OTHER_TOPIC_VALUE) {
      setIsCustomMode(true);
      if (currentTopic && PREDEFINED_TOPICS.includes(currentTopic)) {
        onTopicChange(""); 
      } else if (!currentTopic) {
        onTopicChange(""); 
      }
    } else {
      setIsCustomMode(false);
      onTopicChange(value); 
    }
  };

  const handleCustomInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTopicChange(event.target.value); 
  };

  let dropdownDisplayValue: string | undefined;
  if (isCustomMode) {
    dropdownDisplayValue = OTHER_TOPIC_VALUE;
  } else if (currentTopic && PREDEFINED_TOPICS.includes(currentTopic)) {
    dropdownDisplayValue = currentTopic;
  } else {
    dropdownDisplayValue = undefined; 
  }
  
  const customInputValue = isCustomMode ? (currentTopic || "") : "";

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
          <div className="animate-in fade-in-50 duration-300">
            <Label htmlFor="custom-topic-input" className="mb-1 block">Or enter your custom topic</Label>
            <Input
              id="custom-topic-input"
              type="text"
              placeholder="e.g., Advanced React Hooks"
              value={customInputValue}
              onChange={handleCustomInputChange}
              disabled={disabled}
              aria-label="Custom topic input"
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
