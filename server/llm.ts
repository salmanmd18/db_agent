import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are a friendly and helpful customer service assistant for Dobbs Tire & Auto Centers, a family-operated auto service company in St. Louis since 1976.

IMPORTANT GUIDELINES:
- Be concise and friendly, like a helpful service advisor
- Never invent specific prices - always say "prices vary" or "contact your local store for pricing"
- Never claim exact inventory - say "I can help check availability"
- For tire size questions, explain where to find it (sidewall, driver door jamb, owner's manual)
- Always funnel toward scheduling: offer to collect appointment information
- If you don't know something, say "I don't have that specific information, but I can help connect you with our team"

KNOWN FACTS ABOUT DOBBS:
- Over 50 locations in the St. Louis area
- Services: tires, brakes, alignments, oil changes, batteries, general auto repair
- Tire brands: Michelin, Goodyear, Bridgestone, Firestone, Continental, Pirelli, Cooper, BF Goodrich, and more
- Free tire inspections
- Price-match guarantee on tires
- Most locations open Mon-Sat roughly 7AM-6PM (hours vary by location)
- ASE-certified technicians
- Family-operated since 1976

Keep responses under 3 sentences when possible.`;

interface LLMResponse {
  answer: string;
  isSchedulingIntent: boolean;
}

export async function getLLMResponse(userMessage: string): Promise<LLMResponse> {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    // Fallback to a generic response when no API key is available
    return {
      answer: "Thanks for your question! Dobbs Tire & Auto Centers provides tires, brakes, alignments, oil changes, batteries, and general auto repair. We're family-operated since 1976 with over 50 locations in the St. Louis area. For specific information, I'd be happy to help you schedule an appointment with one of our locations. Would you like to do that?",
      isSchedulingIntent: false,
    };
  }

  try {
    const groq = new Groq({ apiKey: groqApiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.1-8b-instant", // Free tier model
      temperature: 0.7,
      max_tokens: 200,
    });

    const answer = completion.choices[0]?.message?.content || 
      "I'm here to help! Could you please rephrase your question?";

    // Detect if the response or question involves scheduling
    const isSchedulingIntent = 
      userMessage.toLowerCase().includes("appointment") ||
      userMessage.toLowerCase().includes("schedule") ||
      userMessage.toLowerCase().includes("book") ||
      answer.toLowerCase().includes("schedule an appointment") ||
      answer.toLowerCase().includes("book an appointment");

    return {
      answer,
      isSchedulingIntent,
    };
  } catch (error) {
    console.error("Groq API error:", error);
    
    // Fallback response on error
    return {
      answer: "I'm having trouble connecting to my knowledge base right now. Dobbs Tire & Auto Centers offers tires, brakes, oil changes, alignments, and more at over 50 locations. Would you like to schedule an appointment so our team can help you directly?",
      isSchedulingIntent: false,
    };
  }
}

export async function getHuggingFaceFallback(userMessage: string): Promise<string> {
  // HuggingFace Inference API fallback (free tier)
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  
  if (!hfToken) {
    return "I'm here to help with questions about Dobbs Tire & Auto Centers. We offer tires, brakes, oil changes, and more. What can I help you with today?";
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Context: You are a Dobbs Tire & Auto Centers assistant. Dobbs provides tires, brakes, oil changes, alignments, and auto repair at 50+ St. Louis locations since 1976.\n\nCustomer: ${userMessage}\n\nAssistant:`,
          parameters: {
            max_length: 150,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("HuggingFace API failed");
    }

    const data = await response.json();
    return data[0]?.generated_text || "How can I help you with Dobbs services today?";
  } catch (error) {
    console.error("HuggingFace fallback error:", error);
    return "Thanks for your question about Dobbs! How can I assist you with our tire and auto services?";
  }
}
