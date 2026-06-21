"use client";

import React, { useEffect, useRef, useState } from "react";
import { TreePine, Plane, UtensilsCrossed, Smartphone } from "lucide-react";
import { getEquivalences } from "../../lib/carbonUtils";

interface EquivalenceCardsProps {
  weeklyKg: number;
}

interface CardConfig {
  key: keyof ReturnType<typeof getEquivalences>;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  color: string;
  borderColor: string;
  iconBg: string;
  formatter?: (v: number) => string;
}

const CARDS: CardConfig[] = [
  {
    key: "trees",
    icon: TreePine,
    label: "Trees to Offset",
    sublabel: "annual trees needed to absorb this week's CO₂",
    color: "text-emerald-700 dark:text-emerald-300",
    borderColor: "border-l-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    key: "flights",
    icon: Plane,
    label: "London–Paris Flights",
    sublabel: "equivalent short-haul flights",
    color: "text-blue-700 dark:text-blue-300",
    borderColor: "border-l-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    key: "beefMeals",
    icon: UtensilsCrossed,
    label: "Beef Burgers",
    sublabel: "burger meals with equivalent emissions",
    color: "text-amber-700 dark:text-amber-300",
    borderColor: "border-l-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  {
    key: "smartphoneCharges",
    icon: Smartphone,
    label: "Smartphone Charges",
    sublabel: "full phone battery charges",
    color: "text-purple-700 dark:text-purple-300",
    borderColor: "border-l-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    formatter: (v: number) => v.toLocaleString(),
  },
];

function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (target === valueRef.current) return;
    const from = valueRef.current;
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = parseFloat((from + (target - from) * eased).toFixed(2));
      setValue(nextVal);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
}

function EquivalenceCard({ card, value }: { card: CardConfig; value: number }) {
  const animated = useCountUp(value, 800);
  const Icon = card.icon;

  const display = card.formatter
    ? card.formatter(Math.round(animated))
    : animated < 1
    ? animated.toFixed(2)
    : animated.toFixed(1);

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 border-l-4 ${card.borderColor} shadow-sm p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-lg p-2.5 ${card.iconBg}`}>
          <Icon className={`h-5 w-5 ${card.color}`} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">
          This Week
        </span>
      </div>

      <div>
        <p
          className={`text-3xl font-black tracking-tight ${card.color}`}
          aria-label={`${display} ${card.label}`}
        >
          {display}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
          {card.label}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">
          {card.sublabel}
        </p>
      </div>
    </div>
  );
}

export const EquivalenceCards = React.memo(function EquivalenceCards({ weeklyKg }: EquivalenceCardsProps) {
  const equiv = getEquivalences(weeklyKg);

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      role="region"
      aria-label="Emissions equivalence metrics"
    >
      {CARDS.map(card => (
        <EquivalenceCard
          key={card.key}
          card={card}
          value={equiv[card.key] as number}
        />
      ))}
    </div>
  );
});
