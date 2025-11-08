# NxtWave Voice AI Onboarding Agent

## Overview
This is a LiveKit-based voice AI agent designed for NxtWave onboarding calls. The agent, named "Harshitha", conducts conversations in Telugu with parents whose children have reserved a seat in NxtWave programs. It uses RAG (Retrieval Augmented Generation) with LlamaIndex to provide contextual responses based on the onboarding narrative.

## Project Architecture

### Technology Stack
- **Language**: Python 3.11
- **Voice AI Framework**: LiveKit Agents
- **LLM**: Google Gemini (gemini-2.5-flash-exp-native-audio-thinking-dialog)
- **Embeddings**: Google Gemini Embedding (embedding-001)
- **RAG Framework**: LlamaIndex
- **Voice**: Google Cloud Text-to-Speech (Voice: Aoede)

### Key Components
- `agent.py`: Main agent implementation with NxtWave onboarding logic
- `data/nxtwave_onboarding_narrative.txt`: Knowledge base for RAG system
- `requirements.txt`: Python dependencies
- `.env.example`: Template for required environment variables

### Agent Capabilities
- Conducts full onboarding conversations in Telugu
- Handles objections and resistance using RAG
- Explains payment options (Full Payment & No-Cost EMI)
- Guides through KYC and document submission process
- Uses narrative-driven conversation flow

## Setup Instructions

### Required API Keys
This project requires the following API keys (stored as environment variables):

1. **GOOGLE_API_KEY**: For Google Gemini LLM and embeddings
2. **LIVEKIT_URL**: LiveKit server URL
3. **LIVEKIT_API_KEY**: LiveKit API key
4. **LIVEKIT_API_SECRET**: LiveKit API secret

### Important Configuration
Before running the agent, you **must** replace the placeholder content in `data/nxtwave_onboarding_narrative.txt` with the actual NxtWave onboarding narrative. The narrative should include all 8 sections as outlined in the placeholder file.

## Running the Agent

The workflow is configured to run: `python agent.py dev`

This starts the LiveKit agent in development mode and connects to your LiveKit server.

## Frontend Application

### Technology Stack
- React 18 + TypeScript
- Vite 7.2
- TailwindCSS + custom UI components
- React Router for navigation
- localStorage for session persistence

### Features
- **Auth Screen** (`/auth`): User registration with name and phone validation
- **Call Screen** (`/call`): Interactive voice conversation interface with:
  - Stage-based stepper showing conversation progress
  - Voice visualizer with animated states (speaking, listening, thinking, etc.)
  - Real-time transcript panel showing agent and user messages
  - Controls for mute/unmute and ending call
  - Responsive design (desktop + mobile)

### Conversation Stages
1. INTRO - Introduction and rapport building
2. PROGRAM_VALUE_L1 - Program value explanation
3. PAYMENT_STRUCTURE - Payment options discussion
4. NBFC - No-Cost EMI explanation
5. RCA - Co-applicant requirements
6. KYC - Document submission
7. END_FLOW - Call completion

### File Structure
```
frontend/
├── src/
│   ├── components/      # UI components
│   ├── screens/         # Auth and Main screens
│   ├── hooks/           # useConversationManager hook
│   ├── lib/             # Utilities (storage, stageMachine, utils)
│   └── types.ts         # TypeScript type definitions
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

## Recent Changes
- 2025-11-08: Complete project setup with frontend and backend
  - **Backend**: Renamed main file from "agent_2 (1).py" to "agent.py"
  - Created requirements.txt with all dependencies
  - Installed Python 3.11 and all required packages
  - Created data directory structure
  - Set up .gitignore for Python project
  - Configured Backend Agent workflow
  - **Frontend**: Created React + TypeScript + Vite application
  - Set up TailwindCSS with custom color scheme
  - Implemented all UI components (Stepper, VoiceVisualizer, TranscriptionPanel, Controls)
  - Created Auth and Main screens with routing
  - Implemented localStorage persistence for session management
  - Configured Frontend workflow on port 5000

## User Preferences
None specified yet.

## Notes
- The agent requires both Google API credentials and LiveKit credentials to function
- The narrative file is critical for the RAG system - agent will have limited knowledge without it
- Agent speaks exclusively in Telugu as configured
- Voice name is set to "Aoede" in the code
