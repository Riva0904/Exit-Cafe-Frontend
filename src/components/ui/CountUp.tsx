import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

export function CountUp({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
    </span>
  );
}
