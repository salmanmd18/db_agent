import httpx
import asyncio

async def test():
    url = "http://localhost:5000/tts"
    payload = {
        "text": "Testing backend endpoint integration."
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print(f"Success! Content length: {len(response.content)}")
            else:
                print(f"Failed: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
