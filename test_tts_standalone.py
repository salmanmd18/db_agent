import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")

async def test_tts():
    if not API_KEY:
        print("Error: ELEVENLABS_API_KEY not found in environment.")
        return
    
    if not VOICE_ID:
        print("Error: ELEVENLABS_VOICE_ID not found in environment.")
        return

    print(f"Testing with API Key: {API_KEY[:4]}...{API_KEY[-4:]}")
    print(f"Testing with Voice ID: {VOICE_ID}")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": "This is a test message from the Dobbs Assistant debugger.",
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.55,
            "similarity_boost": 0.75,
        },
    }

    print(f"Sending request to {url}...")
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json=payload)
    
    print(f"Response Status: {response.status_code}")
    if response.status_code == 200:
        print("Success! Audio content received.")
        print(f"Content length: {len(response.content)} bytes")
    else:
        print("Failed!")
        print(f"Response text: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_tts())
