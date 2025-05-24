import os
import asyncio
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import (
    AgentSession,
    Agent,
    RoomInputOptions,
    ChatContext,
    ChatMessage,
    JobContext,
    WorkerOptions,
)
from livekit.plugins import google
from livekit.plugins import noise_cancellation

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
# from llama_index.core.node_parser import SentenceSplitter # Not explicitly used, but good for awareness
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.gemini import GeminiEmbedding

load_dotenv()

QUERY_ENGINE = None
NARRATIVE_FILE_NAME = "nxtwave_onboarding_narrative.txt" # Switched to the correct narrative

# --- Agent Persona Configuration ---
AGENT_SPOKEN_NAME = "Harshitha"
AGENT_ROLE = "Registration Expert"
CALLING_FROM_COMPANY = "NxtWave EdTech Company"
PRIMARY_WEBSITE_CTA = "ccbp.in"
PRIMARY_PHONE_CTA = "8978487795"
# NBFC_NAME is removed here as the agent is from NxtWave.
# Specific NBFC names (like Varthana) should be in your nxtwave_onboarding_narrative.txt
# and will be mentioned by the agent when discussing EMI partners if relevant.
# The NXTWAVE_COMPANY_INFO string is also removed as its content should ideally be
# part of the main nxtwave_onboarding_narrative.txt for RAG to pick up,
# especially for resistance handling (e.g., funding, NSDC recognition details).
# --- End Configuration ---


def initialize_rag_pipeline():
    global QUERY_ENGINE
    if QUERY_ENGINE is None:
        print(f"Initializing RAG pipeline with {NARRATIVE_FILE_NAME}...")
        try:
            Settings.llm = Gemini(model_name="models/gemini-pro")
            Settings.embed_model = GeminiEmbedding(model_name="models/embedding-001")
            Settings.chunk_size = 768 # Adjusted for detailed narrative
            Settings.chunk_overlap = 50

            script_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(script_dir, "data")
            narrative_path = os.path.join(data_dir, NARRATIVE_FILE_NAME)

            if not os.path.exists(narrative_path):
                os.makedirs(data_dir, exist_ok=True)
                with open(narrative_path, "w", encoding="utf-8") as f: # Added encoding
                    f.write(f"""
                        # Placeholder for {NARRATIVE_FILE_NAME}
                        This is a placeholder file. CRITICAL: Please replace its content with the actual NxtWave Onboarding Narrative.
                        The narrative should cover:
                        - Introduction and Rapport Building (Greeting, Agent Intro as {AGENT_SPOKEN_NAME} from {CALLING_FROM_COMPANY})
                        - Product Value Explanation (NxtWave programs, addressing education gap)
                        - Pricing and Payment Options (Full Payment, No-Cost EMI via NBFCs)
                        - Detailed No-Cost EMI explanation (Benefits, partner NBFCs like Varthana, Bajaj Finserv etc.)
                        - KYC and Co-applicant details (Documents, consent video)
                        - Comprehensive Resistance Handling for various objections (e.g. NxtWave stability, funding details)
                        - Closing, Urgency Hooks, and clear CTAs (including {PRIMARY_WEBSITE_CTA} and {PRIMARY_PHONE_CTA})
                    """)
                print(f"CRITICAL: Dummy '{NARRATIVE_FILE_NAME}' created in '{data_dir}'. ")
                print(f"Replace it with your actual NxtWave Onboarding Narrative for the agent to function correctly.")

            documents = SimpleDirectoryReader(data_dir).load_data()
            # Basic check if it's still placeholder or empty
            if not documents or os.path.getsize(narrative_path) < 200 or "Placeholder" in documents[0].text[:300]:
                print(f"WARNING: No valid documents found or '{NARRATIVE_FILE_NAME}' seems to be a placeholder.")
                print("Agent will lack specific knowledge from the narrative. Please provide the correct file content.")
                QUERY_ENGINE = None
            else:
                index = VectorStoreIndex.from_documents(documents)
                QUERY_ENGINE = index.as_query_engine(similarity_top_k=4, response_mode="refine") # Adjusted for detailed narrative
                print("RAG pipeline initialized successfully.")

        except Exception as e:
            print(f"Error initializing RAG pipeline: {e}")
            QUERY_ENGINE = None

class NxtWaveOnboardingAgent(Agent): # Renamed class
    def __init__(self, query_engine, llm_instructions) -> None:
        super().__init__(instructions=llm_instructions)
        self.query_engine = query_engine

    async def on_user_turn_completed(
        self, turn_ctx: ChatContext, new_message: ChatMessage,
    ) -> None:
        user_query = new_message.text_content()
        print(f"User says: {user_query}")

        if not self.query_engine:
            print("RAG query engine not available. Relying on LLM's general instructions.")
            turn_ctx.add_message(
                role="system",
                content="Internal note: Knowledge base (NxtWave Onboarding Narrative) is currently unavailable. Proceed based on general instructions. Be cautious about making specific claims that require the narrative."
            )
            return

        if user_query and len(user_query.strip()) > 2: # Only query RAG for substantive input
            print(f"User query for RAG: {user_query}")
            try:
                response = await asyncio.to_thread(self.query_engine.query, user_query)
                rag_content = str(response)
                print(f"RAG retrieved content snippet: {rag_content[:250]}...")

                if rag_content and rag_content.strip().lower() != "empty response":
                    turn_ctx.add_message(
                        role="system",
                        content=f"Relevant information from the NxtWave Onboarding Narrative: '{rag_content}'. Use this to inform your Telugu response, adhering to your role and the conversational flow outlined in your primary instructions."
                    )
                else:
                    print("No specific content found from RAG for this query. LLM will rely on its primary instructions.")
                    turn_ctx.add_message(
                        role="system",
                        content="Internal note: No specific information found in the NxtWave Onboarding Narrative for the user's last input. Continue based on primary instructions. If a direct question was asked that you can't answer, acknowledge that or use default proactive engagement if applicable."
                    )
            except Exception as e:
                print(f"Error during RAG lookup: {e}")
                turn_ctx.add_message(
                    role="system",
                    content="Internal note: Error accessing the NxtWave Onboarding Narrative. Proceed with caution."
                )
        else:
            print(f"Short user input ('{user_query}'). Relying on LLM's primary instructions for flow, potentially triggering default proactive engagement.")
            turn_ctx.add_message(
                role="system",
                content="User input was minimal. Assess conversational context. If appropriate, and not in a critical flow or objection handling, consider the 'Default Proactive Engagement' strategy from your primary instructions."
            )

async def entrypoint(ctx: JobContext):
    initialize_rag_pipeline()

    # --- Comprehensive LLM Instructions for NxtWave Onboarding Expert: Harshitha ---
    llm_instructions = (
        f"You are '{AGENT_SPOKEN_NAME}', a highly skilled '{AGENT_ROLE}' from '{CALLING_FROM_COMPANY}'. Your primary language for all responses MUST be Telugu. "
        f"You are a specialist in narrative building and a sales manager responsible for onboarding parents whose children have reserved a seat in a NxtWave program. "
        f"Your communication must be assertive, empathetic, and highly persuasive. Your main goal is to guide the parent through the onboarding process as detailed in the NxtWave Onboarding Narrative (your primary knowledge source), address their concerns, and secure their commitment to submit the required documents for the chosen payment plan.\n\n"

        f"**Core Responsibilities & Conversational Flow (Strictly follow the NxtWave Onboarding Narrative sections):**\n"
        f"1.  **Introduction & Rapport (Follow Section 1 of the Narrative):**\n"
        f"    * When the call begins, or if the user says 'Hello', 'Yevaru?' (Who is this?), 'Who is this?', or any similar greeting/query, you MUST immediately and clearly introduce yourself in Telugu. Example: 'Namaste! Nenu {AGENT_SPOKEN_NAME}, {CALLING_FROM_COMPANY} nunchi {AGENT_ROLE} ni మాట్లాడుతున్నాను. Am I speaking with Mr./Mrs. [Parent's Name if known, otherwise ask]? Good day! How are you doing today?'\n"
        f"    * Then, state the purpose: 'Your child, [Child's Name], has successfully reserved a seat in our program, and I’m calling to guide you through the next important steps of the process.'\n"
        f"    * Assertively request 10 minutes, emphasizing the importance: 'This is about your child’s career and future, a very important decision. Would you have 10 minutes right now to discuss this?' Handle objections to timing as per the narrative, always aiming to secure the time slot.\n"
        f"    * If they agree, appreciate their proactive step for their child's future.\n"

        f"2.  **Appreciation & Icebreaking (Follow Section 2 of the Narrative):**\n"
        f"    * Congratulate them on the child's seat reservation. Highlight selectivity. Praise child's initiative. Acknowledge parent's involvement (if per CGE).\n"
        f"    * Build rapport (min. 5 mins): Ask about their profession, location, child's living situation & academics. Genuinely engage.\n"

        f"3.  **NxtWave Program Value & Outcome (Follow Section 3 of the Narrative):**\n"
        f"    * Explain the 'Education Gap' (use 'Car Example'). Detail how NxtWave's hands-on learning, IDP, Growth Cycles, Success Coaches fill this gap for industry readiness. Be compelling about child's future.\n"

        f"4.  **Pricing & Payment Options (Follow Section 4 of the Narrative):**\n"
        f"    * Transition: 'Since the seat has been reserved, let’s talk about the next step: payment.' Confirm CGE fee details. Present Full Payment vs. No-Cost EMI options. Ask preference assertively.\n"

        f"5.  **NBFC & No-Cost EMI Explanation (Follow Section 5 of the Narrative - if EMI chosen/discussed):**\n"
        f"    * Explain NBFCs, NxtWave partnership rationale, and **No-Cost EMI benefits** (no interest, small installments, no collateral, digital). Mention RBI-approved partners (e.g., Varthana, Bajaj Finserv) if in narrative.\n"

        f"6.  **KYC & Right Co-Applicant (RCA) (Follow Section 6 of the Narrative - crucial for EMI):**\n"
        f"    * Explain co-applicant need. List documents (PAN, Aadhaar, Bank Proof, Photo, Consent Video with sample script). Instruct on CIBIL check. Guide on alternatives if parent not eligible.\n"

        f"7.  **Resistance Handling (Follow Section 7 of the Narrative):**\n"
        f"    * Use RAG (narrative content) for specific, empathetic, assertive Telugu responses to objections. Alleviate concerns, reinforce trust.\n"

        f"**8. Default Proactive Engagement (Use if user is silent, gives minimal response like 'ok'/'hmm', or asks generic 'tell me more' type questions, AND you are NOT in a critical flow like objection handling or active info gathering):**\n"
        f"   * Proactively lead: 'To help you make the best decision for [Child's Name]'s future, let me highlight a couple of important aspects about how NxtWave supports families.' (Adapt to natural Telugu).\n"
        f"   * **Explain No-Cost EMI Importance:** Briefly reiterate benefits from Section 5 of narrative (affordability, no extra financial burden). E.g., 'One key aspect is our No-Cost EMI. You pay no interest, just the fee in easy installments.'\n"
        f"   * **Reinforce NxtWave's Value:** Briefly discuss NxtWave's mission/impact on child's career success (from Section 3 of narrative). E.g., 'NxtWave is dedicated to building strong careers with practical, job-ready skills.'\n"
        f"   * **Provide Clear CTAs:** Conclude with: 'For more details, visit our website {PRIMARY_WEBSITE_CTA}, or call our support line {PRIMARY_PHONE_CTA}.' (Telugu: 'Inka vivarala kosam, meeru maa website {PRIMARY_WEBSITE_CTA} ni chudavachchu, leda ಸಹಾಯం కొరకు మా సపోర్ట్ లైన్ {PRIMARY_PHONE_CTA} ki call cheyavachchu.')\n"
        f"   * Gently transition back to the main onboarding flow or ask for specific questions on what was shared.\n"

        f"9.  **Closing & Urgency for Document Submission (Follow Section 8 of the Narrative):**\n"
        f"    * After addressing concerns or proactive explanation, assertively ask: 'Are you ready to proceed with document submission to confirm [Child's Name]'s seat and benefits?'\n"
        f"    * If YES: Guide on submission. If NO/hesitant: Use urgency hooks from narrative (e.g., 'Generative AI Workshop'). Goal: Get firm commitment for document collection.\n\n"

        f"**General Guidelines:**\n"
        f"    * **Spoken Name:** You are '{AGENT_SPOKEN_NAME}'.\n"
        f"    * **Language:** All spoken output MUST be fluent, natural, professional TELUGU.\n"
        f"    * **RAG System:** Use 'Relevant information from NxtWave Onboarding Narrative...' (English system messages) to construct detailed, accurate, persuasive Telugu responses. Synthesize, don't just translate.\n"
        f"    * **Assertiveness & Control:** Guide conversation purposefully. Be proactive. Anticipate needs.\n"
        f"    * **Accuracy & Empathy:** Ensure info is accurate (per narrative). Show understanding; link to child's future.\n"
        f"    * **Out-of-Scope:** If truly unrelated to NxtWave/onboarding/career, politely state scope and redirect.\n"
        f"    * **Ending Call:** Conclude professionally, summarize next steps (docs), thank once commitment is secured/follow-up set.\n"
    )
    # --- End Comprehensive LLM Instructions ---

    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-2.5-flash-exp-native-audio-thinking-dialog",
            voice="Aoede", # Changed voice back to Puck as per earlier good versions, "Kore" was in user's snippet. Adjust if needed.
            temperature=0.8,
            instructions=llm_instructions,
        ),
        # stt=google.STT(language="te-IN"),
    )

    await session.start(
        room=ctx.room,
        agent=NxtWaveOnboardingAgent(query_engine=QUERY_ENGINE, llm_instructions=llm_instructions), # Using the renamed class
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()
    print(f"{AGENT_SPOKEN_NAME} ({AGENT_ROLE} from {CALLING_FROM_COMPANY}) connected. Waiting for user interaction.")

    await session.generate_reply(
        instructions=f"The call has just connected. As '{AGENT_SPOKEN_NAME}', the NxtWave {AGENT_ROLE}, begin the conversation by following Section 1 of your primary instructions: Greet the parent, handle initial queries like 'Hello' or 'Yevaru?', confirm their identity, clearly introduce yourself and NxtWave, state the call's purpose, and assertively request their time."
    )

if __name__ == "__main__":
    if "GOOGLE_API_KEY" not in os.environ and "GOOGLE_APPLICATION_CREDENTIALS" not in os.environ:
        print("Warning: GOOGLE_API_KEY or GOOGLE_APPLICATION_CREDENTIALS not set. LlamaIndex Gemini may fail.")

    narrative_full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", NARRATIVE_FILE_NAME)
    try:
        if not os.path.exists(narrative_full_path) or os.path.getsize(narrative_full_path) < 200:
            print(f"CRITICAL WARNING: The narrative file '{narrative_full_path}' is missing, empty, or too small.")
            print("The agent may not function as intended without the correct NxtWave Onboarding Narrative.")
            if "Placeholder" in open(narrative_full_path, 'r', encoding='utf-8').read(300): # Check specifically for placeholder text
                 print("The narrative file still appears to be a placeholder. Please update it with actual content.")
            # Consider uncommenting to exit if narrative is critical:
            # import sys
            # sys.exit(f"Exiting: Critical narrative file {NARRATIVE_FILE_NAME} not found or is placeholder.")
    except Exception as e:
        print(f"Error checking narrative file '{narrative_full_path}': {e}")
        # import sys
        # sys.exit(f"Exiting due to error checking narrative file.")

    agents.cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))