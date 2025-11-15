import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Send, X, Minimize2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import AppointmentForm from "./AppointmentForm";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertAppointment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatWidgetProps {
  onSendMessage?: (message: string) => Promise<{ answer: string; isSchedulingIntent?: boolean }>;
}

export default function ChatWidget({ onSendMessage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm the Dobbs AI Assistant. How can I help you today? I can answer questions about our services, hours, locations, or help you schedule an appointment.",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const appointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = onSendMessage 
        ? await onSendMessage(inputValue)
        : { answer: "This is a demo response. Connect to the backend to get real AI responses.", isSchedulingIntent: false };

      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.answer,
          isBot: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);

        if (response.isSchedulingIntent) {
          setShowAppointmentForm(true);
        }
      }, 800);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice not supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAppointmentSubmit = async (data: InsertAppointment) => {
    try {
      await appointmentMutation.mutateAsync(data);
      
      setShowAppointmentForm(false);
      const confirmMessage: Message = {
        id: Date.now().toString(),
        text: `Great! I've recorded your appointment request for ${data.serviceType} at our ${data.location} location on ${data.preferredDate}. Our team will contact you shortly to confirm.`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMessage]);
      
      toast({
        title: "Appointment Request Submitted",
        description: "Our team will contact you shortly to confirm.",
      });
    } catch (error) {
      console.error("Appointment submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or call your nearest location.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full shadow-2xl flex items-center justify-center hover-elevate active-elevate-2 z-50 animate-pulse"
        data-testid="button-open-chat"
        aria-label="Open chat"
      >
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300",
        isMinimized 
          ? "bottom-4 right-4 md:bottom-6 md:right-6" 
          : "bottom-0 right-0 md:bottom-4 md:right-4 md:rounded-2xl w-full h-full md:w-[380px] md:h-[600px]"
      )}
    >
      <Card className={cn(
        "flex flex-col shadow-2xl overflow-hidden h-full",
        isMinimized && "hidden"
      )}>
        <div className="bg-primary h-16 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <div>
              <h3 className="text-primary-foreground font-semibold text-base" data-testid="text-chat-title">
                Dobbs Assistant
              </h3>
              <p className="text-primary-foreground/80 text-xs">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
              onClick={() => setIsMinimized(true)}
              data-testid="button-minimize-chat"
              aria-label="Minimize chat"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-chat"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showAppointmentForm ? (
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            <AppointmentForm
              onSubmit={handleAppointmentSubmit}
              onCancel={() => setShowAppointmentForm(false)}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      message.isBot
                        ? "bg-muted text-foreground rounded-bl-none"
                        : "bg-primary text-primary-foreground rounded-br-none"
                    )}
                    data-testid={`message-${message.id}`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t bg-background p-3 flex-shrink-0">
              {isRecording && (
                <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Listening...
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  data-testid="input-chat-message"
                  aria-label="Chat message input"
                />
                <Button
                  size="icon"
                  variant={isRecording ? "destructive" : "secondary"}
                  onClick={handleVoiceToggle}
                  data-testid="button-voice"
                  aria-label={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  data-testid="button-send-message"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {isMinimized && (
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl"
          data-testid="button-restore-chat"
          aria-label="Restore chat"
        >
          <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
        </Button>
      )}
    </div>
  );
}
