import ChatWidget from "@/components/ChatWidget";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatResponse } from "@shared/schema";

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
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Dobbs AI Service Assistant
            </h1>
            <p className="text-xl text-muted-foreground">
              Experience our AI-powered customer service chatbot for Dobbs Tire & Auto Centers
            </p>
          </div>

          <div className="bg-card border border-card-border rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-semibold">Demo Features</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">💬 Smart Responses</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant answers about hours, locations, tire brands, services, and more
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">🎤 Voice Input</h3>
                <p className="text-sm text-muted-foreground">
                  Use the microphone button to speak your questions (browser support required)
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">📅 Appointment Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Capture appointment leads with our intelligent form system
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">📱 Mobile Responsive</h3>
                <p className="text-sm text-muted-foreground">
                  Works seamlessly on desktop, tablet, and mobile devices
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold">Try asking:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <code className="bg-background px-3 py-1 rounded text-sm">What are your hours?</code>
              <code className="bg-background px-3 py-1 rounded text-sm">What tire brands do you carry?</code>
              <code className="bg-background px-3 py-1 rounded text-sm">Schedule an appointment</code>
              <code className="bg-background px-3 py-1 rounded text-sm">Where are you located?</code>
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
