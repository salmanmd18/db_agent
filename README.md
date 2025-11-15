# Dobbs AI Service Assistant

A production-ready AI-powered customer service chatbot for Dobbs Tire & Auto Centers, built with React, Express, and free-tier AI models.

## Features

- **Intelligent FAQ System**: Instant answers about hours, locations, tire brands, services, pricing, and warranties
- **AI-Powered Responses**: Groq LLM integration with HuggingFace fallback for natural conversations
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
- Express.js + TypeScript
- Groq SDK (free tier: llama-3.1-8b-instant)
- Keyword-based FAQ search with semantic matching
- JSON file storage for leads

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (Optional)

For enhanced AI responses, add these optional API keys to your environment:

```bash
# Optional: For enhanced LLM responses (free tier available)
GROQ_API_KEY=your_groq_api_key_here

# Optional: For HuggingFace fallback
HUGGINGFACE_TOKEN=your_hf_token_here
```

**Note**: The chatbot works without API keys using the built-in FAQ database and fallback responses.

### 3. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Usage

1. Click the red chat button in the bottom-right corner
2. Ask questions about:
   - Store hours and locations
   - Tire brands and services
   - Pricing and warranties
   - Appointment scheduling
3. Use the microphone button for voice input (see Voice Input Requirements below)
4. Type "schedule an appointment" to trigger the lead capture form

### Voice Input Requirements

Voice input is available when **all** of these conditions are met:

- **Secure Connection**: HTTPS (or localhost for development)
- **Supported Browser**: Chrome, Edge, or Safari (Web Speech API required)
- **Microphone Permission**: Browser must have permission to access the microphone

**Note**: The microphone button will be disabled if voice input is not supported. If you click it and get an error:
- Check that you're using HTTPS (not HTTP)
- Ensure you're using a supported browser
- Allow microphone access when prompted
- Check browser microphone permissions in settings

## API Endpoints

### POST `/api/chat`
Send a user message and receive an AI response.

**Request:**
```json
{
  "message": "What are your hours?"
}
```

**Response:**
```json
{
  "answer": "Most Dobbs locations are open Monday through Saturday...",
  "isSchedulingIntent": false
}
```

### POST `/api/appointments`
Create an appointment lead.

**Request:**
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

Edit `server/faq.ts` and add to the `FAQ_DATABASE` array:

```typescript
{
  question: "Your question here?",
  answer: "Your answer here.",
  keywords: ["keyword1", "keyword2", "keyword3"],
}
```

### Changing Appointment Form Fields

Modify the dropdowns in `client/src/components/AppointmentForm.tsx`:

```typescript
const LOCATIONS = ["Location1", "Location2", ...];
const SERVICE_TYPES = ["Service1", "Service2", ...];
```

## Deployment

### Replit Deployment

This app is configured for Replit deployment:

1. The workflow "Start application" runs `npm run dev`
2. Server binds to `0.0.0.0:5000`
3. All static assets served by Vite

### Production Considerations

- **API Keys**: Set `GROQ_API_KEY` as a Replit secret for enhanced responses
- **Lead Storage**: Consider migrating from JSON file to a database for production scale
- **Rate Limiting**: Add rate limiting middleware for the `/api/chat` endpoint
- **CORS**: Configure CORS for embedding on the Dobbs website

## Embedding on External Website

To embed this chatbot on the Dobbs website:

```html
<iframe 
  src="https://your-replit-url.replit.app" 
  style="position: fixed; bottom: 0; right: 0; width: 380px; height: 600px; border: none; z-index: 9999;"
  title="Dobbs AI Assistant"
></iframe>
```

Or use JavaScript to load it dynamically:

```html
<script>
  const script = document.createElement('script');
  script.src = 'https://your-replit-url.replit.app/embed.js';
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
