import { useState, useRef, useEffect } from "react";

import { APP_CONSTANTS } from "../lib/constants";

/**
 * Custom hook to animate a number from its current/previous value to a new target value.
 * Uses requestAnimationFrame and a cubic ease-out function for smooth transitions.
 * 
 * State managed:
 * - value: The current animated numeric state displayed to the user.
 * 
 * @param target - The final target value to animate towards.
 * @param durationMs - The duration of the animation in milliseconds (defaults to APP_CONSTANTS.ANIMATION_DURATION_MS).
 * @returns The current animated value state.
 */
export function useCountUp(
  target: number,
  durationMs = APP_CONSTANTS.ANIMATION_DURATION_MS
): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (target === valueRef.current) return;
    const from = valueRef.current;
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const prog = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      const nextVal = parseFloat((from + (target - from) * eased).toFixed(3));
      setValue(nextVal);
      if (prog < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
}
