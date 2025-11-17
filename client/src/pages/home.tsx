import ChatWidget from "@/components/ChatWidget";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatResponse } from "@shared/schema";
import { Bot, CalendarCheck, Mic, Smartphone } from "lucide-react";

const demoFeatures = [
  {
    title: "Smart Responses",
    description: "Get instant answers about hours, locations, tire brands, and services.",
    icon: Bot,
  },
  {
    title: "Voice Input",
    description: "Ask questions hands-free from supported browsers with one tap.",
    icon: Mic,
  },
  {
    title: "Appointment Booking",
    description: "Capture appointment leads with the guided multi-step form.",
    icon: CalendarCheck,
  },
  {
    title: "Mobile Friendly",
    description: "Responsive experience that feels native on phones and tablets.",
    icon: Smartphone,
  },
];

export default function Home() {
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      return res.json() as Promise<ChatResponse>;
    },
  });

  const handleSendMessage = async (message: string): Promise<{ answer: string; isSchedulingIntent?: boolean }> => {
    try {
      const response = await chatMutation.mutateAsync(message);
      return response;
    } catch (error) {
      console.error("Chat error:", error);
      return {
        answer: "I'm having trouble connecting right now. Please try again in a moment.",
        isSchedulingIntent: false,
      };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Customer service reinvented</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Dobbs AI Service Assistant
            </h1>
            <p className="text-xl text-muted-foreground">
              Experience our AI-powered chatbot for Dobbs Tire & Auto Centers. Answer questions instantly or capture a service lead without waiting on hold.
            </p>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm text-primary font-semibold">Highlights</p>
              <h2 className="text-2xl font-semibold">What you can try right now</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              {demoFeatures.map(({ title, description, icon: Icon }) => (
                <div key={title} className="space-y-2 rounded-xl border border-dashed border-border/70 p-4 bg-background">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-semibold text-lg">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-primary font-semibold">Need inspiration?</p>
              <h3 className="font-semibold text-lg">Try asking one of these prompts</h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "What are your hours?",
                "What tire brands do you carry?",
                "Schedule an appointment",
                "Where are you located?",
              ].map((prompt) => (
                <code key={prompt} className="bg-background px-3 py-1 rounded-full text-sm border border-border/70">
                  {prompt}
                </code>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Click the red chat button in the bottom-right corner to start chatting!
          </p>
        </div>
      </div>

      <ChatWidget onSendMessage={handleSendMessage} />
    </div>
  );
}
