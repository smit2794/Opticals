import { useState, useEffect, useRef } from 'react';

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

export default function Counter({
  end,
  duration = 2,
  suffix = '',
  prefix = '',
  className = '',
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const durationMs = duration * 1000;

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const easedProgress = easeOutQuart(progress);
            const currentCount = Math.round(easedProgress * end);

            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={`counter-value ${className}`} style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 800,
      fontSize: 'clamp(2rem, 4vw, 3.5rem)',
      letterSpacing: '-1px',
      lineHeight: 1.1,
    }}>
      {prefix}{count}{suffix}
    </span>
  );
}
