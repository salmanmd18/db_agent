import { useMutation } from "@tanstack/react-query";

import { sendChatMessage } from "../lib/api";
import type { ChatRequest, ChatResponse } from "../types/api";

export function useChat() {
  const mutation = useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: sendChatMessage,
  });

  return {
    sendMessage: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    error: mutation.error,
  };
}
