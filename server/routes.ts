import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchFAQ, detectSchedulingIntent } from "./faq";
import { getLLMResponse } from "./llm";
import { chatMessageSchema, insertAppointmentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint - handles user messages and returns AI responses
  app.post("/api/chat", async (req, res) => {
    try {
      const parseResult = chatMessageSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { message } = parseResult.data;

      // Step 1: Try to find answer in FAQ database
      const faqResult = searchFAQ(message);
      
      if (faqResult) {
        const isSchedulingIntent = detectSchedulingIntent(message);
        return res.json({
          answer: faqResult.answer,
          isSchedulingIntent,
        });
      }

      // Step 2: If no FAQ match, use LLM
      const llmResponse = await getLLMResponse(message);
      
      return res.json(llmResponse);
    } catch (error) {
      console.error("Chat error:", error);
      return res.status(500).json({
        answer: "I'm having trouble right now. Please try again in a moment.",
        isSchedulingIntent: false,
      });
    }
  });

  // Appointment endpoints
  app.post("/api/appointments", async (req, res) => {
    try {
      const parseResult = insertAppointmentSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const appointment = await storage.createAppointment(parseResult.data);
      
      return res.status(201).json(appointment);
    } catch (error) {
      console.error("Appointment creation error:", error);
      return res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      return res.json(appointments);
    } catch (error) {
      console.error("Appointments fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      return res.json(appointment);
    } catch (error) {
      console.error("Appointment fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
