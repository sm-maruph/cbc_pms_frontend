// src/components/StatsSection.jsx
import { useEffect, useRef, useState } from "react";

const rawStats = [
  { label: "Years in Business", value: 9, suffix: "+" },
  { label: "Offices", value: 2 },
  { label: "Happy Customers", value: 100, suffix: "+" },
  { label: "Visitors", value: 2000, suffix: "+" },
];

function formatValue(n, suffix = "") {
  return `${n}${suffix || ""}`;
}

export default function StatsSection({ animate = true, duration = 4000 }) {
  const [counts, setCounts] = useState(() =>
    rawStats.map((s) => (animate ? 0 : s.value))
  );
  const rafRefs = useRef([]);

  useEffect(() => {
    if (!animate) return;

    // Clean previous RAFs
    rafRefs.current.forEach((id) => cancelAnimationFrame(id));
    rafRefs.current = [];

    rawStats.forEach((stat, idx) => {
      const start = performance.now();
      const from = 0;
      const to = stat.value;
      const ms = Math.max(200, duration); // enforce a minimum duration

      function step(now) {
        const t = Math.min(1, (now - start) / ms);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad-ish
        const current = Math.round(from + (to - from) * eased);
        setCounts((prev) => {
          const copy = [...prev];
          copy[idx] = current;
          return copy;
        });
        if (t < 1) {
          rafRefs.current[idx] = requestAnimationFrame(step);
        } else {
          // ensure exact final value
          setCounts((prev) => {
            const copy = [...prev];
            copy[idx] = to;
            return copy;
          });
        }
      }

      rafRefs.current[idx] = requestAnimationFrame(step);
    });

    return () => {
      rafRefs.current.forEach((id) => cancelAnimationFrame(id));
      rafRefs.current = [];
    };
  }, [animate, duration]);

  return (
    <section
      className="
    py-12 text-center
    bg-accent
    text-heading dark:text-heading
    transition-colors duration-300
  "
    >
      <h1 className="text-2xl md:text-2xl text-center text-heading mb-10">
        Latest Collection
      </h1>

      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 font-semibold">
        {rawStats.map(({ label, suffix }, i) => {
          const value = counts[i] ?? rawStats[i].value;
          return (
            <div
              key={label}
              className="min-h-[72px] flex flex-col items-center justify-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold leading-none">
                {formatValue(value, suffix)}
              </div>
              <div className="mt-2 uppercase text-xs tracking-widest text-text-heading dark:text-text-heading">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
