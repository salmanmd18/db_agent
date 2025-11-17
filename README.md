# Dobbs AI Service Assistant

A production-ready AI-powered customer service chatbot for Dobbs Tire & Auto Centers, now powered by React on the frontend and a FastAPI backend written in Python with integrated ElevenLabs text-to-speech (TTS).

## Features

- **Intelligent FAQ System**: Instant answers about hours, locations, tire brands, services, pricing, and warranties
- **AI + Voice Agent**: Deterministic AI replies with optional ElevenLabs-powered speech playback
- **Voice Input**: Web Speech API support for hands-free interaction (requires HTTPS and Chrome/Edge/Safari)
- **Appointment Lead Capture**: Intelligent form triggered by scheduling intent detection
- **Mobile Responsive**: Full-screen on mobile, floating widget on desktop
- **Lead Storage**: All appointment requests saved to `/leads/appointments.json`

## Tech Stack

### Frontend
- React + TypeScript
- TailwindCSS + Shadcn UI components
- TanStack Query for API state management
- Web Speech API for voice input
- Wouter for routing

### Backend
- FastAPI (Python 3.10 via `uv`) serving REST endpoints
- ElevenLabs TTS REST API for natural speech playback
- Keyword-based FAQ search with scheduling intent detection
- JSON file storage for leads (same format as the previous Node server)

## Setup Instructions

### 1. Install JavaScript dependencies
```bash
npm install
```

### 2. Install Python dependencies
Create/activate the `.venv` with `uv venv .venv` (already available), then:
```bash
uv pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env` (or export the variables in your shell) and set the following:

```bash
# Frontend origin allowed to call the API (optional)
APP_ORIGIN=http://localhost:5173

# ElevenLabs TTS credentials
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=YOUR_DEFAULT_VOICE_ID_HERE
```

The assistant responds with FAQ answers and a deterministic fallback even without the ElevenLabs API key, but the `/tts` endpoint will be disabled.

### 4. Run the Application in Development
```bash
npm run dev
```
This launches Vite on `http://localhost:5173` and FastAPI on `http://localhost:5000` simultaneously using `concurrently`.

### 5. Production Build
```bash
npm run build   # produces dist/public
npm start       # serves the built client + API on port 5000
```

## Usage

1. Click the red chat button in the bottom-right corner
2. Ask questions about:
   - Store hours and locations
   - Tire brands and services
   - Pricing and warranties
   - Appointment scheduling
3. Use the microphone button for voice input (see requirements below)
4. Toggle the new "Voice Reply" control in the chat widget to receive spoken replies (requires ElevenLabs API key)
5. Type "schedule an appointment" to trigger the lead capture form

### Voice Input Requirements

Voice input is available when **all** of these conditions are met:

- **Secure Connection**: HTTPS (or localhost for development)
- **Supported Browser**: Chrome, Edge, or Safari (Web Speech API required)
- **Microphone Permission**: Browser must have permission to access the microphone

**Server Voice Agent**: To hear spoken answers, set `ELEVENLABS_API_KEY` and enable the voice reply toggle. The backend streams ElevenLabs MP3 audio back to the browser via `/tts`.

## API Endpoints

### POST `/api/chat`
Send a user message and receive an AI response.

```json
{
  "message": "What are your hours?"
}
```

### POST `/api/appointments`
Create an appointment lead.

```json
{
  "name": "John Doe",
  "location": "Chesterfield",
  "serviceType": "Oil Change",
  "preferredDate": "2024-01-15",
  "preferredTime": "morning"
}
```

### GET `/api/appointments`
Retrieve all appointment leads.

### GET `/api/appointments/{id}`
Retrieve a single appointment record.

### POST `/tts`
Send `{ "text": "Your message", "voice_id": "optional_voice_override" }` and receive an MP3 audio stream suitable for playback.

## FAQ Knowledge Base

The chatbot includes 15+ pre-configured FAQ topics covering:
- Hours of operation
- Tire brands (Michelin, Goodyear, Bridgestone, etc.)
- Services offered
- Locations (50+ stores in St. Louis area)
- Price-match guarantee
- Free tire inspections
- Oil changes, brakes, alignments, batteries
- Company history (family-operated since 1976)

## Customization

### Adding New FAQ Entries

Edit `backend/faq.py` and add to the `FAQ_DATABASE` list:

```python
FAQItem(
  question="Your question here?",
  answer="Your answer here.",
  keywords=["keyword1", "keyword2", "keyword3"],
)
```

### Changing Appointment Form Fields

Modify the dropdowns in `client/src/components/AppointmentForm.tsx`:

```typescript
const LOCATIONS = ["Location1", "Location2", ...];
const SERVICE_TYPES = ["Service1", "Service2", ...];
```

## Deployment

1. `npm run build`
2. Ensure environment variables are configured on the host
3. `npm start` to run FastAPI (Uvicorn) on port 5000 serving both the API and the built client

### Production Considerations

- **API Keys**: Set `ELEVENLABS_API_KEY` (and optional `ELEVENLABS_VOICE_ID`) as secrets for the voice agent
- **Lead Storage**: Consider migrating from JSON to a database for production scale
- **Rate Limiting**: Add rate limiting middleware for the `/api/chat` endpoint
- **CORS**: Configure `APP_ORIGIN` when embedding the widget on another domain

## Embedding on External Website

```html
<iframe 
  src="https://your-deployment-url"
  style="position: fixed; bottom: 0; right: 0; width: 380px; height: 600px; border: none; z-index: 9999;"
  title="Dobbs AI Assistant"
></iframe>
```

Or dynamically load the widget script:

```html
<script>
  const script = document.createElement('script');
  script.src = 'https://your-deployment-url/embed.js';
  document.body.appendChild(script);
</script>
```

## Testing

The application includes comprehensive end-to-end testing covering:
- Chat widget open/close/minimize functionality
- FAQ question answering
- Voice input support
- Appointment form submission
- Message persistence
- Error handling

## Support

For questions about the Dobbs AI Service Assistant, contact the development team.

## License

Proprietary - Dobbs Tire & Auto Centers
