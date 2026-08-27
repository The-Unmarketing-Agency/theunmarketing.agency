"use client";

import { useState } from "react";

type ArticleShareButtonsProps = {
  title: string;
  url?: string;
};

export function ArticleShareButtons({ title, url }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleShare = (platform: "linkedin" | "x") => {
    const currentUrl = getShareUrl();
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);

    const target =
      platform === "linkedin"
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        : `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;

    window.open(target, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    const currentUrl = getShareUrl();
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleEmail = () => {
    const currentUrl = getShareUrl();
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`Check out this article: ${currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="article-share">
      <div className="article-share__buttons">
        <button
          aria-label="Share on X"
          className="article-share__button"
          onClick={() => handleShare("x")}
          title="Share on X"
          type="button"
        >
          <svg aria-hidden="true" fill="currentColor" height="15" viewBox="0 0 24 24" width="15">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        <button
          aria-label="Share via Email"
          className="article-share__button"
          onClick={handleEmail}
          title="Share via Email"
          type="button"
        >
          <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
            <rect height="16" rx="2" width="20" x="2" y="4" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </button>

        <button
          aria-label="Copy link to clipboard"
          className={`article-share__button ${copied ? "article-share__button--copied" : ""}`}
          onClick={handleCopy}
          title={copied ? "Link Copied!" : "Copy link"}
          type="button"
        >
          <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>

        <button
          aria-label="Share on LinkedIn"
          className="article-share__button"
          onClick={() => handleShare("linkedin")}
          title="Share on LinkedIn"
          type="button"
        >
          <svg aria-hidden="true" fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.91 0-1.64.73-1.64 1.64 0 .91.73 1.64 1.64 1.64.91 0 1.64-.73 1.64-1.64 0-.91-.73-1.64-1.64-1.64Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
