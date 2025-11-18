export async function playAudioFromArrayBuffer(buffer: ArrayBuffer): Promise<void> {
  const blob = new Blob([buffer], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  try {
    const audio = new Audio(url);
    await audio.play();
  } finally {
    URL.revokeObjectURL(url);
  }
}
