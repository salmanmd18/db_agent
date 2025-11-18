import { useMutation } from "@tanstack/react-query";

import { createAppointment } from "../lib/api";
import type { Appointment, AppointmentCreate } from "../types/api";

export function useCreateAppointment() {
  const mutation = useMutation<Appointment, Error, AppointmentCreate>({
    mutationFn: createAppointment,
  });

  return {
    createAppointment: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    error: mutation.error,
    data: mutation.data,
  };
}
