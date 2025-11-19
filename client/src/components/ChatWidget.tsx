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
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import AppointmentForm from "./AppointmentForm";
import { useChat } from "@/hooks/useChat";
import { fetchTtsAudio } from "@/lib/api";
import { playAudioFromArrayBuffer, type AudioController } from "@/lib/audio";
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
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<AudioController | null>(null);
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

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsRecording(true);
    };
    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsRecording(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Speech recognition result:", transcript);
      setInputValue(transcript);
      setIsRecording(false);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please check your browser permissions.",
          variant: "destructive",
        });
      } else if (event.error === "no-speech") {
        // Often happens if no speech is detected quickly
        toast({
          title: "No speech detected",
          description: "Please try again.",
          variant: "default",
        });
      } else {
        toast({
          title: "Voice input error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      }
    };

    recognitionRef.current = recognition;
    setVoiceSupported(true);

    return () => {
      recognition.stop();
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.stop();
      currentAudioRef.current = null;
    }
    setIsPlayingAudio(false);
  };

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
      // Stop any currently playing audio before starting new one
      stopAudio();

      try {
        const buffer = await fetchTtsAudio({ text: assistantText });
        const controller = await playAudioFromArrayBuffer(buffer);
        currentAudioRef.current = controller;
        setIsPlayingAudio(true);

        controller.audio.onended = () => {
          setIsPlayingAudio(false);
          currentAudioRef.current = null;
        };
      } catch (error) {
        console.error("Voice agent error:", error);
        toast({
          title: "Voice agent unavailable",
          description: "Unable to synthesize speech. Audio playback was skipped.",
          variant: "destructive",
        });
        setIsPlayingAudio(false);
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

    // Stop audio when user sends a message
    stopAudio();

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

    // Stop any playing audio when starting to record
    stopAudio();

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
    <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {isOpen && !isMinimized && (
        <Card className="chat-widget-panel flex flex-col shadow-2xl overflow-hidden border border-white/20 w-screen h-screen rounded-none md:w-[380px] md:h-[600px] md:rounded-3xl backdrop-blur-md bg-background/95 dark:bg-slate-900/90 transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in">
          {/* Header */}
          <div className="bg-primary/90 backdrop-blur-sm h-16 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
              <div>
                <h3 className="text-primary-foreground font-bold text-base tracking-tight" data-testid="text-chat-title">
                  Dobbs Assistant
                </h3>
                <p className="text-primary-foreground/80 text-[10px] uppercase tracking-wider font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-foreground hover:bg-white/10 h-8 w-8 rounded-full transition-colors"
                onClick={() => setIsMinimized(true)}
                data-testid="button-minimize-chat"
                aria-label="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-foreground hover:bg-white/10 h-8 w-8 rounded-full transition-colors"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-chat"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          {showAppointmentForm ? (
            <div className="flex-1 overflow-y-auto p-4 bg-background/50">
              <AppointmentForm
                onSuccess={(appointment) => handleAppointmentSuccess(appointment)}
                onCancel={() => setShowAppointmentForm(false)}
              />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex w-full", message.from === "assistant" ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed",
                        message.from === "assistant"
                          ? "bg-white dark:bg-slate-800 text-foreground rounded-bl-none border border-border/50"
                          : "bg-primary text-primary-foreground rounded-br-none shadow-md",
                      )}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-border/50 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-border/40 bg-background/80 backdrop-blur-md p-3 flex-shrink-0 space-y-3">
                {/* Status Indicators */}
                <div className="flex items-center justify-between min-h-[20px]">
                  <div className="flex items-center gap-2">
                    {isRecording && (
                      <div className="text-xs font-medium text-red-500 flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        Listening...
                      </div>
                    )}
                    {isGeneratingVoice && (
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating voice...
                      </div>
                    )}
                    {isPlayingAudio && (
                      <div className="text-xs font-medium text-primary flex items-center gap-2">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                        Speaking...
                      </div>
                    )}
                  </div>

                  {isPlayingAudio && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stopAudio}
                      className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <StopCircle className="w-3 h-3 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="pr-10 bg-secondary/50 border-transparent focus:border-primary/30 focus:bg-background transition-all duration-200"
                      data-testid="input-chat-message"
                      aria-label="Chat message input"
                      disabled={isChatLoading}
                    />
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant={voiceReplyEnabled ? "default" : "ghost"}
                      onClick={() => setVoiceReplyEnabled((prev) => !prev)}
                      className={cn("transition-all duration-200", !voiceReplyEnabled && "text-muted-foreground hover:text-foreground")}
                      data-testid="button-voice-agent"
                      aria-pressed={voiceReplyEnabled}
                      aria-label={voiceReplyEnabled ? "Disable voice replies" : "Enable voice replies"}
                      title="Voice replies"
                    >
                      {voiceReplyEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant={isRecording ? "destructive" : "secondary"}
                      onClick={handleVoiceToggle}
                      disabled={!voiceSupported}
                      className={cn("transition-all duration-200", isRecording && "animate-pulse shadow-lg shadow-red-500/20")}
                      data-testid="button-voice"
                      aria-label={isRecording ? "Stop recording" : "Start voice input"}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isChatLoading}
                      className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200"
                      data-testid="button-send-message"
                      aria-label="Send message"
                    >
                      {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {isMinimized && (
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 bg-primary text-primary-foreground"
          data-testid="button-restore-chat"
          aria-label="Restore chat"
        >
          <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
        </Button>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-primary/50"
          data-testid="button-open-chat"
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7 md:w-8 md:h-8 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}
