import ChatWidget from "../ChatWidget";

export default function ChatWidgetExample() {
  const handleSendMessage = async (message: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    
    return {
      answer: "Thanks for your question! Dobbs Tire & Auto Centers provides tires, brakes, alignments, oil changes, batteries, and general auto repair. We're family-operated since 1976. How can I help you today?",
      isSchedulingIntent: false,
    };
  };

  return <ChatWidget onSendMessage={handleSendMessage} />;
}
