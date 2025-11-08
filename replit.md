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

## Recent Changes
- 2025-11-08: Initial project setup in Replit environment
  - Renamed main file from "agent_2 (1).py" to "agent.py"
  - Created requirements.txt with all dependencies
  - Installed Python 3.11 and all required packages
  - Created data directory structure
  - Set up .gitignore for Python project
  - Configured LiveKit Voice Agent workflow

## User Preferences
None specified yet.

## Notes
- The agent requires both Google API credentials and LiveKit credentials to function
- The narrative file is critical for the RAG system - agent will have limited knowledge without it
- Agent speaks exclusively in Telugu as configured
- Voice name is set to "Aoede" in the code
