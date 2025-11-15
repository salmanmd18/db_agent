import { type User, type InsertUser, type Appointment, type InsertAppointment } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private appointments: Map<string, Appointment>;
  private appointmentsFilePath: string;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.appointmentsFilePath = path.join(process.cwd(), "leads", "appointments.json");
    this.initializeAppointmentsFile();
  }

  private async initializeAppointmentsFile() {
    try {
      const leadsDir = path.join(process.cwd(), "leads");
      await fs.mkdir(leadsDir, { recursive: true });
      
      try {
        const data = await fs.readFile(this.appointmentsFilePath, "utf-8");
        const appointments: Appointment[] = JSON.parse(data);
        appointments.forEach((apt) => this.appointments.set(apt.id, apt));
      } catch (error) {
        // File doesn't exist yet, create empty array
        await fs.writeFile(this.appointmentsFilePath, "[]", "utf-8");
      }
    } catch (error) {
      console.error("Error initializing appointments file:", error);
    }
  }

  private async saveAppointmentsToFile() {
    try {
      const appointments = Array.from(this.appointments.values());
      await fs.writeFile(
        this.appointmentsFilePath,
        JSON.stringify(appointments, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Error saving appointments to file:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    await this.saveAppointmentsToFile();
    return appointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
}

export const storage = new MemStorage();
