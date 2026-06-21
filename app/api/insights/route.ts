import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getPotentialSavings,
  getCompassScore,
  getEquivalences,
  getCategoryBreakdown,
  getTotalForPeriod,
} from "../../../lib/carbonUtils";
import { sanitizeString } from "../../../lib/sanitize";
import { ActivityEntry, UserProfile, CompassScore, PotentialSaving, InsightResponse } from "../../../lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserContext {
  profile: UserProfile;
  recentActivities: ActivityEntry[];
  weeklyTotal: number;
  topCategory: string;
  topSubtype: string;
  categoryBreakdown: Record<string, number>;
  streak: number;
  compassScore: CompassScore;
  potentialSavings: PotentialSaving[];
}

// ─── Fallback (used when Gemini JSON parse fails) ────────────────────────────

const FALLBACK_RESPONSE: InsightResponse = {
  summary:
    "I wasn't able to fully analyze your data right now, but here are general tips based on your top category.",
  actions: [
    {
      title: "Track consistently",
      description:
        "Log activities daily to build accurate trends for better recommendations.",
      estimatedSavingKg: 0,
      effort: "easy",
    },
    {
      title: "Focus on your biggest category",
      description: "Reduce your highest-emission category by 10% this week.",
      estimatedSavingKg: 0,
      effort: "medium",
    },
    {
      title: "Try one swap",
      description: "Replace one high-emission choice with a lower alternative.",
      estimatedSavingKg: 0,
      effort: "easy",
    },
  ],
  equivalences: { trees: 0, flights: 0, beefMeals: 0, smartphoneCharges: 0 },
};

// ─── API Key guard ────────────────────────────────────────────────────────────

const NO_KEY_RESPONSE: InsightResponse = {
  summary:
    "🧭 CarbonCompass AI is not yet connected — add your GEMINI_API_KEY to .env.local to unlock personalized insights. In the meantime, here are evidence-based tips based on common patterns.",
  actions: [
    {
      title: "Switch car trips to bus or train",
      description:
        "Taking public transit instead of a petrol car cuts travel emissions by ~58%. Even 3 days a week makes a measurable difference.",
      estimatedSavingKg: 5.5,
      effort: "medium",
    },
    {
      title: "Replace one beef meal with legumes",
      description:
        "Beef emits ~27 kg CO₂e per kg; legumes emit 0.9 kg. One swap per week saves over 26 kg CO₂e across a month.",
      estimatedSavingKg: 6.75,
      effort: "easy",
    },
    {
      title: "Reduce home electricity by 20%",
      description:
        "Simple habits — shorter showers, off-peak appliance use, switching off standby — typically yield a 15–25% reduction.",
      estimatedSavingKg: 1.6,
      effort: "easy",
    },
  ],
  equivalences: { trees: 0.66, flights: 0.06, beefMeals: 4.07, smartphoneCharges: 2000 },
};

// ─── Handler ──────────────────────────────────────────────────────────────────

// Reject any non-POST methods with 405 Method Not Allowed
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  // ── Content-Type guard (415 Unsupported Media Type) ────────────────────────
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported Media Type — application/json required" },
      { status: 415 }
    );
  }

  // ── Body size guard (413 Payload Too Large) ─────────────────────────────────
  const rawBody = await req.text();
  if (rawBody.length > 10 * 1024) {
    return NextResponse.json({ error: "Payload Too Large" }, { status: 413 });
  }

  let body: { message?: unknown; context?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate message
  const rawMessage = body.message;
  if (typeof rawMessage !== "string" || !rawMessage.trim() || rawMessage.length > 500) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const message = sanitizeString(rawMessage, 500);
  if (!message) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate context
  const ctx = body.context as UserContext | undefined;
  if (!ctx || typeof ctx !== "object" || !ctx.profile || !Array.isArray(ctx.recentActivities)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // ── API Key check ──────────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json(NO_KEY_RESPONSE, { status: 200 });
  }

  // Production: add rate limiting middleware (e.g., Upstash @upstash/ratelimit)
  try {
    // ── Step 3: Pre-calculate all numbers deterministically ────────────────
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const potentialSavings = getPotentialSavings(ctx.profile, ctx.recentActivities);
    const compassScore = getCompassScore(ctx.recentActivities, ctx.streak ?? 0);
    const weeklyTotal = getTotalForPeriod(ctx.recentActivities, weekStart, now);
    const equivalences = getEquivalences(weeklyTotal);
    const breakdown = getCategoryBreakdown(ctx.recentActivities, weekStart, now);

    // Build a rich data summary for Gemini (text only — no math required)
    const dataSummary = {
      profile: {
        name: ctx.profile.name,
        country: ctx.profile.country,
        lifestyle: ctx.profile.lifestyle,
        commute: ctx.profile.commute,
        diet: ctx.profile.diet,
        energySource: ctx.profile.energySource,
      },
      weeklyTotalKg: weeklyTotal,
      compassScore: compassScore.score,
      compassLabel: compassScore.label,
      categoryBreakdown: breakdown,
      topCategory: ctx.topCategory,
      topSubtype: ctx.topSubtype,
      streak: ctx.streak ?? 0,
    };

    // ── Step 4: System prompt ──────────────────────────────────────────────
    const systemPrompt = `You are CarbonCompass AI, a friendly and knowledgeable carbon footprint sustainability coach. You have access to the user's real tracking data AND pre-calculated savings provided as context.

RULES:
- Analyze the user's SPECIFIC data. Never give generic advice.
- Reference their actual numbers (e.g., "Your transport emissions of 12.3 kg this week are 45% of your total...").
- Consider their country (provided in context) and lifestyle when suggesting alternatives.
- If they are in India, suggest local alternatives (metro, electric auto-rickshaw, seasonal vegetables, solar water heater).
- If they are in UK or USA, suggest relevant local alternatives (cycling infrastructure, heat pumps, Meatless Monday).
- If they have high transport but already use public transit, praise them and focus on other categories.
- Be encouraging — highlight wins before suggesting improvements.
- Keep responses concise: max 2-3 sentences for the summary.

CRITICAL — PRE-CALCULATED SAVINGS:
The following savings have been calculated deterministically by the app's emission engine.
DO NOT recalculate or alter any numbers. Use them exactly as provided.
Your job is to select the top 3 most impactful savings and write personalized, motivating titles and descriptions for each.
Pre-calculated savings array: ${JSON.stringify(potentialSavings)}

If the pre-calculated savings array has fewer than 3 items, fill remaining slots with general advice using estimatedSavingKg: 0.

IMPORTANT: Your entire response must be ONLY the raw JSON object — no markdown fences, no backticks, no extra text before or after the JSON.
Output exactly:
{
  "summary": "2-3 sentence personalized analysis referencing their actual data numbers",
  "actions": [
    {
      "title": "Short motivating title (max 8 words)",
      "description": "Specific description in context of their habits (1-2 sentences)",
      "estimatedSavingKg": 0.0,
      "effort": "easy"
    }
  ]
}
Return exactly 3 actions ranked by estimatedSavingKg descending. Do NOT wrap in backticks. Do NOT include an equivalences field.`;

    const userContent = `User message: ${message}\n\nUser data summary:\n${JSON.stringify(dataSummary, null, 2)}`;

    // ── Step 5: Call Gemini 2.0 Flash with JSON mode (SDK 0.24.x+) ──────────
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(
      systemPrompt + "\n\n" + userContent
    );


    // ── Step 6: Defensive JSON parsing ────────────────────────────────────
    let rawText = result.response.text().trim();
    // Strip accidental markdown fences
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let geminiResponse: { summary: string; actions: InsightResponse["actions"] };
    try {
      geminiResponse = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse Gemini JSON:", rawText.slice(0, 200));
      return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
    }

    // Validate shape minimally
    if (!geminiResponse.summary || !Array.isArray(geminiResponse.actions)) {
      return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
    }

    // Merge: use Gemini text + deterministic equivalences
    const finalResponse: InsightResponse = {
      summary: geminiResponse.summary,
      actions: geminiResponse.actions.slice(0, 3),
      equivalences, // always from getEquivalences(), never from Gemini
    };

    return NextResponse.json(finalResponse, { status: 200 });
  } catch (error: unknown) {
    // Log full details server-side for debugging, but never expose to client
    if (error instanceof Error) {
      console.error("[insights/route] Error name:", error.name);
      console.error("[insights/route] Error message:", error.message);
      console.error("[insights/route] Error stack:", error.stack?.split("\n").slice(0, 4).join("\n"));
    } else {
      console.error("[insights/route] Unknown error:", JSON.stringify(error));
    }
    return NextResponse.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 500 }
    );
  }
}
