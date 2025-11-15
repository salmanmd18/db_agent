import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  const handleSendMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("hour") || lowerMessage.includes("open")) {
      return {
        answer: "Most Dobbs locations are open Monday through Saturday, roughly 7AM to 6PM. Hours may vary by location. Would you like help scheduling an appointment?",
        isSchedulingIntent: false,
      };
    }
    
    if (lowerMessage.includes("tire") && (lowerMessage.includes("brand") || lowerMessage.includes("carry"))) {
      return {
        answer: "Dobbs carries all major tire brands including Michelin, Goodyear, Bridgestone, Firestone, Continental, Pirelli, Cooper, BF Goodrich, and more. We also offer free tire inspections and a price-match guarantee!",
        isSchedulingIntent: false,
      };
    }
    
    if (lowerMessage.includes("appointment") || lowerMessage.includes("schedule") || lowerMessage.includes("book")) {
      return {
        answer: "I'd be happy to help you schedule an appointment! Let me collect some information from you.",
        isSchedulingIntent: true,
      };
    }
    
    if (lowerMessage.includes("location") || lowerMessage.includes("where")) {
      return {
        answer: "Dobbs has over 50 convenient locations throughout the St. Louis area including Ballwin, Chesterfield, Clayton, Fenton, and many more. Which area are you closest to?",
        isSchedulingIntent: false,
      };
    }
    
    if (lowerMessage.includes("oil change") || lowerMessage.includes("oil")) {
      return {
        answer: "Dobbs offers professional oil change services using quality products. Prices vary by vehicle type and oil grade. Would you like to schedule an appointment for an oil change?",
        isSchedulingIntent: false,
      };
    }

    if (lowerMessage.includes("brake")) {
      return {
        answer: "Dobbs provides expert brake service including inspection, pad replacement, rotor resurfacing, and complete brake system repairs. We use quality parts and our ASE-certified technicians ensure your safety. Would you like to schedule a brake inspection?",
        isSchedulingIntent: false,
      };
    }

    if (lowerMessage.includes("alignment")) {
      return {
        answer: "We offer professional wheel alignment services to ensure proper tire wear and vehicle handling. Signs you may need an alignment include uneven tire wear or your vehicle pulling to one side. Would you like to schedule an alignment check?",
        isSchedulingIntent: false,
      };
    }

    if (lowerMessage.includes("battery")) {
      return {
        answer: "Dobbs provides battery testing and replacement services. We carry quality batteries for all vehicle types. If your car is slow to start or you're experiencing electrical issues, we can help. Would you like to schedule a battery check?",
        isSchedulingIntent: false,
      };
    }

    if (lowerMessage.includes("warranty") || lowerMessage.includes("guarantee")) {
      return {
        answer: "Dobbs offers a price-match guarantee on all tire purchases. We'll match any advertised sale price from a local store or dealer. We also provide warranties on our services and parts. What specific service are you interested in?",
        isSchedulingIntent: false,
      };
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return {
        answer: "Prices vary depending on your vehicle type and specific service needs. We offer competitive pricing and a price-match guarantee on tires. For an accurate quote, I recommend scheduling an appointment or calling your nearest location. Would you like me to help you schedule an appointment?",
        isSchedulingIntent: false,
      };
    }
    
    return {
      answer: "Thanks for your question! Dobbs Tire & Auto Centers provides tires, brakes, alignments, oil changes, batteries, and general auto repair. We're family-operated since 1976 with over 50 locations in the St. Louis area. How can I help you today?",
      isSchedulingIntent: false,
    };
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
