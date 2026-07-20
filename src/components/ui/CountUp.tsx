import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

export function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  startOnView = false,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  startOnView?: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const shouldAnimate = !startOnView || inView;

  useEffect(() => {
    if (!shouldAnimate) return;
    const controls = animate(prevValue.current, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, shouldAnimate]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
