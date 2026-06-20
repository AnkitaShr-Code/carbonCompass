import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Safety check for unset API key to ensure a graceful UX during demo setups
    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { 
          reply: "Hi! I am your local CarbonCompass companion. 🧭\n\nNote: The GEMINI_API_KEY has not been configured in your .env.local file yet. Please set it to connect directly with my live Gemini 1.5 Flash AI coach! \n\nIn the meantime, did you know that changing just one beef meal to a plant-based vegan alternative cuts food emissions by nearly 90% (from 4.8kg down to 0.45kg CO₂e)? Or that taking public transit instead of driving reduces travel emissions by almost 80%? Give these a try!"
        },
        { status: 200 }
      );
    }

    const { messages } = (await req.json()) as {
      messages?: { role: string; content: string }[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty messages history." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Set up the model and inject system guidance
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: 
        "You are the CarbonCompass AI Coach, a supportive, practical, and highly knowledgeable sustainability assistant. " +
        "You help users analyze their carbon footprint (in kg CO2 equivalent) based on transportation, energy, food, and waste activities. " +
        "Keep recommendations brief, positive, and structured. When referring to daily limits, use the user's budget target (defaults to 15 kg CO2e) " +
        "and suggest actionable, low-effort changes (e.g. thermostat adjustment, cold water laundry, carpooling)."
    });

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    const historyMessages = messages.slice(0, messages.length - 1);

    // Map history to the specific structure Google Gen AI SDK expects
    const formattedHistory = historyMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const response = await chat.sendMessage(lastMessage.content);
    const replyText = response.response.text();

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
