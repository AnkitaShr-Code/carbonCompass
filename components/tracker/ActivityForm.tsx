"use client";

import React, { useState } from "react";
import { EMISSION_FACTORS } from "../../lib/emissionFactors";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface ActivityFormProps {
  onAddActivity: (activity: any) => { success: boolean; errors: string[]; entry?: any };
}

export function ActivityForm({ onAddActivity }: ActivityFormProps) {
  const [category, setCategory] = useState<'transport' | 'food' | 'energy' | 'shopping' | 'waste'>("transport");
  const [subtype, setSubtype] = useState("car_petrol");
  const [quantity, setQuantity] = useState("10");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsgs, setErrorMsgs] = useState<string[]>([]);

  // Update subtypes when category changes
  const handleCategoryChange = (cat: 'transport' | 'food' | 'energy' | 'shopping' | 'waste') => {
    setCategory(cat);
    setSuccessMsg("");
    setErrorMsgs([]);
    
    // Choose default subtype
    const subOptions = getSubtypeOptions(cat);
    if (subOptions[0]) {
      setSubtype(subOptions[0].value);
    }
  };

  const getSubtypeOptions = (cat: 'transport' | 'food' | 'energy' | 'shopping' | 'waste') => {
    const data = EMISSION_FACTORS[cat];
    return Object.keys(data).map((key) => {
      const info = (data as any)[key];
      return {
        value: key,
        label: `${info.label} (${info.factor} kg CO2e / ${info.unit})`,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsgs([]);

    const result = onAddActivity({
      category,
      subtype,
      quantity: parseFloat(quantity),
    });

    if (result.success && result.entry) {
      const co2Val = result.entry.co2e;
      const unitVal = result.entry.unit;
      setSuccessMsg(`Logged successfully! Emitted ${co2Val} kg CO2e for ${quantity} ${unitVal}.`);
      setQuantity("10");
    } else {
      setErrorMsgs(result.errors || ["Failed to log activity."]);
    }
  };

  const categoryOptions = [
    { value: "transport", label: "🚗 Transportation" },
    { value: "food", label: "🍔 Food & Diet" },
    { value: "energy", label: "⚡ Energy consumption" },
    { value: "shopping", label: "🛍️ Shopping" },
    { value: "waste", label: "🗑️ Waste disposal" },
  ];

  const currentUnit = (EMISSION_FACTORS[category] as any)[subtype]?.unit || "units";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary-800 dark:text-primary-200">Log Carbon Activity</CardTitle>
        <CardDescription>Select an activity category and input your usage to calculate emissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
            <Select
              options={categoryOptions}
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as any)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subtype</label>
            <Select
              options={getSubtypeOptions(category)}
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Quantity ({currentUnit})
            </label>
            <Input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Quantity in ${currentUnit}`}
              required
            />
          </div>

          {errorMsgs.length > 0 && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
              <ul className="list-disc pl-5">
                {errorMsgs.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {successMsg && (
            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full">
            Log Activity
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
