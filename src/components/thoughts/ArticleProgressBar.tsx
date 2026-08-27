"use client";

import { useEffect, useState } from "react";

export function ArticleProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentProgress = (window.scrollY / scrollHeight) * 100;
      setProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="blog-progress"
      style={{
        transform: `scaleX(${progress / 100})`,
      }}
    />
  );
}
