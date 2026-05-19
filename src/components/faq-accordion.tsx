"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <div className={cn("divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      {items.map((item, i) => {
        const open = openId === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              id={`faq-q-${i}`}
              aria-expanded={open}
              aria-controls={`faq-a-${i}`}
              onClick={() => setOpenId(open ? null : i)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
            >
              <span className="text-sm font-bold text-slate-900 sm:text-base">{item.question}</span>
              <span className="mt-0.5 shrink-0 text-orange-600" aria-hidden>
                {open ? "−" : "+"}
              </span>
            </button>
            <div
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              hidden={!open}
              className="px-5 pb-4 text-sm font-medium leading-relaxed text-slate-600"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
