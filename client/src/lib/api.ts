import type {
  Appointment,
  AppointmentCreate,
  ChatRequest,
  ChatResponse,
  TTSRequest,
} from "../types/api";

async function ensureOk(response: Response): Promise<Response> {
  if (!response.ok) {
    const message = (await response.text()) || response.statusText;
    throw new Error(message || "Request failed");
  }
  return response;
}

function mergeHeaders(headers?: HeadersInit): HeadersInit {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  return headers;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...mergeHeaders(options.headers),
  };

  const response = await ensureOk(
    fetch(path, {
      credentials: "include",
      ...options,
      headers,
    }),
  );

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  return apiRequest<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createAppointment(
  payload: AppointmentCreate,
): Promise<Appointment> {
  return apiRequest<Appointment>("/api/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchTtsAudio(payload: TTSRequest): Promise<ArrayBuffer> {
  const response = await ensureOk(
    fetch("/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );

  return response.arrayBuffer();
}
