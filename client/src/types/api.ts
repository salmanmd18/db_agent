export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  text: string;
  should_speak?: boolean;
  intent?: string | null;
  metadata?: Record<string, unknown>;
  isSchedulingIntent?: boolean;
  /**
   * Legacy field supported by the backend for backwards compatibility.
   */
  answer?: string;
};

export type AppointmentCreate = {
  name: string;
  phone: string;
  email?: string | null;
  location?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: string | null;
  preferredDate: string;
  preferredTime?: string | null;
  serviceType?: string | null;
  notes?: string | null;
};

export type Appointment = AppointmentCreate & {
  id: number | string;
  created_at?: string;
  createdAt?: string;
};

export type TTSRequest = {
  text: string;
  voice_id?: string | null;
};
