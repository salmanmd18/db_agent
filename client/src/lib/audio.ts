export interface AudioController {
  stop: () => void;
  audio: HTMLAudioElement;
}

export async function playAudioFromArrayBuffer(
  buffer: ArrayBuffer,
): Promise<AudioController> {
  const blob = new Blob([buffer], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  const controller: AudioController = {
    audio,
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
      URL.revokeObjectURL(url);
    },
  };

  try {
    await audio.play();
    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
    return controller;
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
