import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Minimize2,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import AppointmentForm from "./AppointmentForm";
import { useChat } from "@/hooks/useChat";
import { fetchTtsAudio } from "@/lib/api";
import { playAudioFromArrayBuffer } from "@/lib/audio";
import type { Appointment, ChatResponse } from "@/types/api";

type Message = {
  id: string;
  from: "user" | "assistant";
  text: string;
  timestamp: Date;
  intent?: string | null;
};

const INITIAL_ASSISTANT_MESSAGE: Message = {
  id: "welcome",
  from: "assistant",
  text: "Hi! I'm the Dobbs AI Assistant. How can I help you today? I can answer questions about our services, hours, locations, or help you schedule an appointment.",
  timestamp: new Date(),
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { sendMessage, isLoading: isChatLoading } = useChat();

  const addMessage = (entry: Message) =>
    setMessages((prev) => [...prev, { ...entry, timestamp: new Date() }]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const isSecureContext =
      window.isSecureContext ||
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost";
    const hasSpeechRecognition =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

    if (!isSecureContext || !hasSpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    setVoiceSupported(true);

    return () => {
      recognition.stop();
    };
  }, []);

  const handleChatResponse = async (response: ChatResponse) => {
    const assistantText =
      response.text ?? response.answer ?? "Thanks for reaching out! How else can I assist you?";

    addMessage({
      id: crypto.randomUUID(),
      from: "assistant",
      text: assistantText,
      intent: response.intent ?? (response.isSchedulingIntent ? "schedule" : null),
      timestamp: new Date(),
    });

    if (response.isSchedulingIntent || response.intent === "schedule") {
      setShowAppointmentForm(true);
    }

    if (voiceReplyEnabled && response.should_speak !== false) {
      setIsGeneratingVoice(true);
      try {
        const buffer = await fetchTtsAudio({ text: assistantText });
        await playAudioFromArrayBuffer(buffer);
      } catch (error) {
        console.error("Voice agent error:", error);
        toast({
          title: "Voice agent unavailable",
          description: "Unable to synthesize speech. Audio playback was skipped.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingVoice(false);
      }
    }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isChatLoading) {
      return;
    }

    addMessage({
      id: crypto.randomUUID(),
      from: "user",
      text,
      timestamp: new Date(),
    });

    setInputValue("");
    setIsTyping(true);

    try {
      const response = await sendMessage({ message: text });
      await handleChatResponse(response);
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        id: crypto.randomUUID(),
        from: "assistant",
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAppointmentSuccess = (appointment?: Appointment) => {
    setShowAppointmentForm(false);
    addMessage({
      id: crypto.randomUUID(),
      from: "assistant",
      text: appointment
        ? `Great! I've recorded your appointment request for ${appointment.preferredDate || "the selected date"}. Our team will contact you shortly to confirm.`
        : "Thanks! Your request has been recorded.",
      timestamp: new Date(),
    });
    toast({
      title: "Appointment request sent",
      description: "We'll follow up soon to confirm the details.",
    });
  };

  const handleVoiceToggle = async () => {
    if (!voiceSupported || !recognitionRef.current) {
      toast({
        title: "Voice input unavailable",
        description:
          "Speech recognition requires HTTPS and a supported browser (Chrome, Edge, or Safari).",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      recognitionRef.current.start();
    } catch (error) {
      console.error("Microphone permission error:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && !isMinimized && (
        <Card className="chat-widget-panel flex flex-col shadow-2xl overflow-hidden border border-border/70 w-screen h-screen rounded-none md:w-[380px] md:h-[600px] md:rounded-3xl">
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
                onSuccess={(appointment) => handleAppointmentSuccess(appointment)}
                onCancel={() => setShowAppointmentForm(false)}
              />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex", message.from === "assistant" ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                        message.from === "assistant"
                          ? "bg-muted text-foreground rounded-bl-none"
                          : "bg-primary text-primary-foreground rounded-br-none",
                      )}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
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
                {isGeneratingVoice && (
                  <div className="mb-2 text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Preparing voice reply...
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
                    disabled={isChatLoading}
                  />
                  <Button
                    size="icon"
                    variant={voiceReplyEnabled ? "default" : "outline"}
                    onClick={() => setVoiceReplyEnabled((prev) => !prev)}
                    data-testid="button-voice-agent"
                    aria-pressed={voiceReplyEnabled}
                    aria-label={voiceReplyEnabled ? "Disable voice replies" : "Enable voice replies"}
                    title="Let the assistant speak answers (requires ElevenLabs API key)"
                  >
                    {voiceReplyEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant={isRecording ? "destructive" : "secondary"}
                    onClick={handleVoiceToggle}
                    disabled={!voiceSupported}
                    data-testid="button-voice"
                    aria-label={isRecording ? "Stop recording" : "Start voice input"}
                    title={!voiceSupported ? "Voice input not available in this browser or connection" : undefined}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isChatLoading}
                    data-testid="button-send-message"
                    aria-label="Send message"
                  >
                    {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

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

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 md:w-16 md:h-16 rounded-full shadow-2xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition"
          data-testid="button-open-chat"
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
        </button>
      )}
    </div>
  );
}
