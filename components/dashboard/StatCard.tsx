import React from "react";
import { Card, CardContent } from "../ui/Card";
import { useCountUp } from "../../hooks/useCountUp";

export function StatCard({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  sub?: React.ReactNode;
  accent?: string;
}) {
  const animated = useCountUp(value);
  return (
    <Card className={`border-l-4 ${accent ?? "border-l-primary-500"}`}>
      <CardContent className="pt-5 pb-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-300">{label}</p>
        <p className="mt-1.5 text-2xl font-black text-gray-900 dark:text-white">
          {animated.toFixed(2)}
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-300 ml-1">{unit}</span>
        </p>
        {sub && <div className="mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
