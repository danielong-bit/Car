import * as React from "react";
import { useReducedMotion } from "motion/react";

type CountUpNumberProps = {
  value: number;
  durationMs?: number;
  className?: string;
};

export function CountUpNumber({ value, durationMs = 320, className }: CountUpNumberProps) {
  const reducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = React.useState(value);
  const firstRender = React.useRef(true);
  const previousValue = React.useRef(value);

  React.useEffect(() => {
    const target = Math.max(0, Math.round(value));
    const start = previousValue.current;
    previousValue.current = target;
    if (firstRender.current) {
      firstRender.current = false;
      setDisplayed(target);
      return;
    }
    if (reducedMotion || start === target || durationMs <= 0) {
      setDisplayed(target);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (target - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, reducedMotion, value]);

  return <span className={className}>{displayed.toLocaleString()}</span>;
}
