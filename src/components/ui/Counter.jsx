import { useEffect, useRef } from 'react';

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
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If it has already animated, keep/ensure the final value is displayed
    // and skip observer registration entirely
    if (hasAnimated.current) {
      node.textContent = `${prefix}${end.toLocaleString()}${suffix}`;
      return;
    }

    let animationFrameId = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // Unobserve and disconnect immediately to release main thread listener resources
          observer.unobserve(node);
          observer.disconnect();

          const startTime = performance.now();
          const durationMs = duration * 1000;

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const easedProgress = easeOutQuart(progress);
            const currentCount = Math.round(easedProgress * end);

            if (node) {
              node.textContent = `${prefix}${currentCount.toLocaleString()}${suffix}`;
            }

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(animate);
            }
          }

          animationFrameId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration, prefix, suffix]);

  return (
    <span ref={ref} className={`counter-value ${className}`}>
      {prefix}0{suffix}
    </span>
  );
}
