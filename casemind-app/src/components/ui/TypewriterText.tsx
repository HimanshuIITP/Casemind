"use client";

import { useEffect, useState, useRef } from "react";

interface TypewriterTextProps {
  phrases: string[];
  className?: string;
  speed?: number;
  pauseDuration?: number;
}

export default function TypewriterText({
  phrases,
  className = "",
  speed = 60,
  pauseDuration = 2200,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null!);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    if (isPaused) {
      timeoutRef.current = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timeoutRef.current);
    }

    if (isDeleting) {
      if (charIndex > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, speed / 2.5);
      } else {
        setIsDeleting(false);
        setPhraseIndex((p) => (p + 1) % phrases.length);
      }
    } else {
      if (charIndex < currentPhrase.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, speed);
      } else {
        setIsPaused(true);
      }
    }

    return () => clearTimeout(timeoutRef.current);
  }, [charIndex, isDeleting, isPaused, phraseIndex, phrases, speed, pauseDuration]);

  return (
    <span className={className}>
      {displayText}
      <span className="typing-cursor" aria-hidden="true" />
    </span>
  );
}
