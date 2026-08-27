"use client";

import { useEffect, useState } from "react";

type OfficeClockProps = {
  timeZone: string;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string) {
  const existing = formatterCache.get(timeZone);
  if (existing) return existing;
  const created = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
  formatterCache.set(timeZone, created);
  return created;
}

export function OfficeClock({ timeZone }: OfficeClockProps) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => setTime(formatter(timeZone).format(new Date()));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [timeZone]);

  return <time suppressHydrationWarning>{time}</time>;
}
