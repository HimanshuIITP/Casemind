import uuid
import httpx
import time
import logging
from datetime import datetime, timezone
from pymongo import ASCENDING
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from app.api.ai.schema import ChatRequest, ChatResponse
from app.api.ai.prompts import SYSTEM_PROMPT, CASE_SUMMARY_SYSTEM_PROMPT, CASE_SUMMARY_USER_TEMPLATE, BENCH_BRIEF_SYSTEM_PROMPT, BENCH_BRIEF_USER_TEMPLATE
from app.core.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

PRIMARY_MODEL = "mistral-large-latest"
BACKUP_MODEL = "open-mistral-nemo"

class AIService:
    @staticmethod
    async def _call_mistral(messages: list, model: str) -> str:
        api_key = settings.MISTRAL_API_KEY
        if not api_key:
            logger.error("MISTRAL_API_KEY is not configured.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="INVALID_API_KEY: Mistral API Key is not configured."
            )

        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": 4096,
            "temperature": 0.7
        }

        logger.info(f"Calling Mistral Model: {model}")
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                logger.info(f"Mistral Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("Parsing Response from Mistral")
                    content = data["choices"][0]["message"]["content"]
                    
                    # Clean up common markdown wrappers just in case
                    if content.startswith("```markdown"):
                        content = content[11:]
                    elif content.startswith("```"):
                        content = content[3:]
                    if content.endswith("```"):
                        content = content[:-3]
                        
                    return content.strip()
                
                error_msg = response.text
                logger.error(f"Mistral Error Response: {error_msg}")
                
                if response.status_code == 429:
                    raise HTTPException(status_code=429, detail="API_ERROR: Rate limit exceeded.")
                elif response.status_code == 401:
                    raise HTTPException(status_code=401, detail="INVALID_API_KEY: Unauthorized access to Mistral.")
                elif response.status_code == 404:
                    raise HTTPException(status_code=404, detail="MODEL_LOADING: The requested AI model was not found.")
                elif response.status_code in [500, 503]:
                    raise HTTPException(status_code=503, detail="MODEL_LOADING: The AI model is currently loading or unavailable.")
                else:
                    raise HTTPException(status_code=response.status_code, detail=f"API_ERROR: {error_msg}")
                    
        except httpx.RequestError as e:
            logger.error(f"Network error calling Mistral: {str(e)}", exc_info=True)
            raise HTTPException(status_code=502, detail="NETWORK_ERROR: Unable to connect to AI service.")

    @staticmethod
    async def chat(request: ChatRequest, user_id: str, db: AsyncIOMotorDatabase) -> ChatResponse:
        conversation_id = request.conversation_id
        is_new = False
        
        # Build context if case_id provided
        case_context = ""
        if request.case_id:
            try:
                case_doc = await db["cases"].find_one({"case_id": request.case_id, "created_by": user_id})
                if case_doc:
                    case_context = f"\n\nYou are currently assisting the user on the case '{case_doc.get('title')}' (ID: {case_doc.get('case_id')}). Description: {case_doc.get('description')}. Status: {case_doc.get('status')}. Court: {case_doc.get('court')}."
            except Exception:
                pass
                
        system_content = SYSTEM_PROMPT + case_context
        
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            is_new = True
            messages = [{"role": "system", "content": system_content}]
        else:
            try:
                chat_doc = await db["chats"].find_one({"conversation_id": conversation_id, "user_id": user_id})
                if not chat_doc:
                    conversation_id = str(uuid.uuid4())
                    is_new = True
                    messages = [{"role": "system", "content": system_content}]
                else:
                    messages = chat_doc.get("messages", [{"role": "system", "content": system_content}])
                    # Update system prompt to ensure latest case context
                    if messages and messages[0]["role"] == "system":
                        messages[0]["content"] = system_content
            except Exception as e:
                logger.error("Database error while fetching chat.", exc_info=True)
                raise HTTPException(status_code=500, detail="DATABASE_ERROR: Failed to connect to database.")

        messages.append({"role": "user", "content": request.prompt})

        try:
            ai_content = await AIService._call_mistral(messages, PRIMARY_MODEL)
        except HTTPException as e:
            logger.warning(f"Primary model failed: {e.detail}. Attempting backup model.")
            try:
                ai_content = await AIService._call_mistral(messages, BACKUP_MODEL)
            except HTTPException as fallback_e:
                raise fallback_e
        except Exception as e:
            logger.error("Unexpected error in chat.", exc_info=True)
            raise HTTPException(status_code=500, detail="PROMPT_BUILD_FAILED: Unexpected error generating chat.")

        messages.append({"role": "assistant", "content": ai_content})

        now = datetime.now(timezone.utc)
        try:
            if is_new:
                await db["chats"].insert_one({
                    "conversation_id": conversation_id,
                    "user_id": user_id,
                    "messages": messages,
                    "created_at": now,
                    "updated_at": now
                })
            else:
                await db["chats"].update_one(
                    {"conversation_id": conversation_id, "user_id": user_id},
                    {"$set": {"messages": messages, "updated_at": now}}
                )
        except Exception:
            logger.error("Failed to save chat to database.", exc_info=True)
            raise HTTPException(status_code=500, detail="DATABASE_ERROR: Failed to save chat history.")

        return ChatResponse(
            response=ai_content,
            conversation_id=conversation_id
        )

    @staticmethod
    async def generate_case_summary(case_id: str, user_id: str, db: AsyncIOMotorDatabase) -> str:
        logger.info(f"Starting AI Case Summary generation for Case ID: {case_id}")
        start_time = time.time()
        
        logger.info("Loading Case")
        try:
            case_doc = await db["cases"].find_one({"case_id": case_id, "created_by": user_id})
        except Exception as e:
            logger.error("Database error while fetching case.", exc_info=True)
            raise HTTPException(status_code=500, detail="DATABASE_ERROR: Failed to connect to database.")
            
        if not case_doc:
            logger.warning(f"Case {case_id} not found or access denied for user {user_id}.")
            raise HTTPException(status_code=404, detail="CASE_NOT_FOUND: The specified case does not exist or you do not have permission.")

        logger.info("Loading Documents, Hearings, Timeline, Orders")
        timeline = [doc async for doc in db["timeline"].find({"case_id": case_id}).sort("created_at", ASCENDING)]
        hearings = [doc async for doc in db["hearings"].find({"case_id": case_id}).sort("date", ASCENDING)]
        documents = [doc async for doc in db["documents"].find({"case_id": case_id})]
        
        try:
            evidence = [doc async for doc in db["evidence"].find({"case_id": case_id})]
        except Exception:
            evidence = []
            
        try:
            orders = [doc async for doc in db["orders"].find({"case_id": case_id})]
        except Exception:
            orders = []

        logger.info("Building Prompt")
        context_parts = []
        
        context_parts.append("=== CASE INFO ===")
        context_parts.append(f"Title: {case_doc.get('title', 'N/A')}")
        context_parts.append(f"Description: {case_doc.get('description', 'N/A')}")
        context_parts.append(f"Court: {case_doc.get('court', 'N/A')}")
        context_parts.append(f"Status: {case_doc.get('status', 'N/A')}")
        
        context_parts.append("\n=== TIMELINE ===")
        if timeline:
            for t in timeline:
                context_parts.append(f"- {t.get('created_at', 'N/A')}: {t.get('title', '')} ({t.get('description', '')})")
        else:
            context_parts.append("No timeline events recorded.")

        context_parts.append("\n=== HEARINGS ===")
        if hearings:
            for h in hearings:
                context_parts.append(f"- {h.get('date')} {h.get('time')}: {h.get('status')} [Judge: {h.get('judge', 'N/A')}]")
        else:
            context_parts.append("No hearings scheduled.")

        context_parts.append("\n=== DOCUMENTS ===")
        if documents:
            for d in documents:
                context_parts.append(f"- {d.get('filename')} ({d.get('mime_type')})")
        else:
            context_parts.append("No documents uploaded.")

        context_parts.append("\n=== EVIDENCE ===")
        if evidence:
            for e in evidence:
                context_parts.append(f"- {e.get('description', 'Unknown')}")
        else:
            context_parts.append("No evidence uploaded.")

        context_parts.append("\n=== ORDERS ===")
        if orders:
            for o in orders:
                context_parts.append(f"- {o.get('description', 'Unknown')}")
        else:
            context_parts.append("No court orders issued yet.")

        context_data_str = "\n".join(context_parts)
        user_prompt = CASE_SUMMARY_USER_TEMPLATE.format(context_data=context_data_str)
        messages = [
            {"role": "system", "content": CASE_SUMMARY_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        logger.info("Calling Mistral API")
        model_used = PRIMARY_MODEL
        try:
            ai_content = await AIService._call_mistral(messages, PRIMARY_MODEL)
        except HTTPException as e:
            logger.warning(f"Primary model failed: {e.detail}. Attempting backup model.")
            model_used = BACKUP_MODEL
            try:
                ai_content = await AIService._call_mistral(messages, BACKUP_MODEL)
            except HTTPException as fallback_e:
                logger.error("Backup model also failed.", exc_info=True)
                raise fallback_e
        except Exception as e:
            logger.error("Unexpected error building prompt.", exc_info=True)
            raise HTTPException(status_code=500, detail="PROMPT_BUILD_FAILED: Unexpected error generating summary.")

        execution_time = time.time() - start_time
        logger.info(f"Finished generation in {execution_time:.2f} seconds.")
        
        logger.info("Saving AI History")
        try:
            await db["ai_history"].insert_one({
                "user_id": user_id,
                "case_id": case_id,
                "prompt": user_prompt,
                "model": model_used,
                "response": ai_content,
                "execution_time": execution_time,
                "timestamp": datetime.now(timezone.utc)
            })
        except Exception:
            logger.error("Failed to save AI History to database.", exc_info=True)

        return ai_content

    @staticmethod
    async def generate_bench_brief(case_id: str, user_id: str, db: AsyncIOMotorDatabase) -> str:
        logger.info(f"Starting AI Bench Brief generation for Case ID: {case_id}")
        start_time = time.time()
        
        logger.info("Loading Case")
        try:
            # For judges, they might not be the 'created_by' user, so we just query by case_id
            # In a real system, we'd check if the judge is assigned to this case.
            case_doc = await db["cases"].find_one({"case_id": case_id})
        except Exception as e:
            logger.error("Database error while fetching case.", exc_info=True)
            raise HTTPException(status_code=500, detail="DATABASE_ERROR: Failed to connect to database.")
            
        if not case_doc:
            logger.warning(f"Case {case_id} not found.")
            raise HTTPException(status_code=404, detail="CASE_NOT_FOUND: The specified case does not exist.")

        logger.info("Loading Documents, Hearings, Timeline, Orders")
        timeline = [doc async for doc in db["timeline"].find({"case_id": case_id}).sort("created_at", ASCENDING)]
        hearings = [doc async for doc in db["hearings"].find({"case_id": case_id}).sort("date", ASCENDING)]
        documents = [doc async for doc in db["documents"].find({"case_id": case_id})]
        
        try:
            evidence = [doc async for doc in db["evidence"].find({"case_id": case_id})]
        except Exception:
            evidence = []
            
        try:
            orders = [doc async for doc in db["orders"].find({"case_id": case_id})]
        except Exception:
            orders = []

        logger.info("Building Prompt")
        context_parts = []
        
        context_parts.append("=== CASE INFO ===")
        context_parts.append(f"Title: {case_doc.get('title', 'N/A')}")
        context_parts.append(f"Description: {case_doc.get('description', 'N/A')}")
        context_parts.append(f"Court: {case_doc.get('court', 'N/A')}")
        context_parts.append(f"Status: {case_doc.get('status', 'N/A')}")
        
        context_parts.append("\n=== TIMELINE ===")
        if timeline:
            for t in timeline:
                context_parts.append(f"- {t.get('created_at', 'N/A')}: {t.get('title', '')} ({t.get('description', '')})")
        else:
            context_parts.append("No timeline events recorded.")

        context_parts.append("\n=== HEARINGS ===")
        if hearings:
            for h in hearings:
                context_parts.append(f"- {h.get('date')} {h.get('time')}: {h.get('status')} [Judge: {h.get('judge', 'N/A')}]")
        else:
            context_parts.append("No hearings scheduled.")

        context_parts.append("\n=== DOCUMENTS ===")
        if documents:
            for d in documents:
                context_parts.append(f"- {d.get('filename')} ({d.get('mime_type')})")
        else:
            context_parts.append("No documents uploaded.")

        context_parts.append("\n=== EVIDENCE ===")
        if evidence:
            for e in evidence:
                context_parts.append(f"- {e.get('description', 'Unknown')}")
        else:
            context_parts.append("No evidence uploaded.")

        context_parts.append("\n=== ORDERS ===")
        if orders:
            for o in orders:
                context_parts.append(f"- {o.get('description', 'Unknown')}")
        else:
            context_parts.append("No court orders issued yet.")

        context_data_str = "\n".join(context_parts)
        user_prompt = BENCH_BRIEF_USER_TEMPLATE.format(context_data=context_data_str)
        messages = [
            {"role": "system", "content": BENCH_BRIEF_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        logger.info("Calling Mistral API for Bench Brief")
        model_used = PRIMARY_MODEL
        try:
            ai_content = await AIService._call_mistral(messages, PRIMARY_MODEL)
        except HTTPException as e:
            logger.warning(f"Primary model failed: {e.detail}. Attempting backup model.")
            model_used = BACKUP_MODEL
            try:
                ai_content = await AIService._call_mistral(messages, BACKUP_MODEL)
            except HTTPException as fallback_e:
                logger.error("Backup model also failed.", exc_info=True)
                raise fallback_e
        except Exception as e:
            logger.error("Unexpected error building prompt.", exc_info=True)
            raise HTTPException(status_code=500, detail="PROMPT_BUILD_FAILED: Unexpected error generating summary.")

        execution_time = time.time() - start_time
        logger.info(f"Finished generation in {execution_time:.2f} seconds.")
        
        logger.info("Saving AI History")
        try:
            await db["ai_history"].insert_one({
                "user_id": user_id,
                "case_id": case_id,
                "prompt": user_prompt,
                "model": model_used,
                "response": ai_content,
                "type": "bench_brief",
                "execution_time": execution_time,
                "timestamp": datetime.now(timezone.utc)
            })
        except Exception:
            logger.error("Failed to save AI History to database.", exc_info=True)

        return ai_content

    @staticmethod
    async def legal_research(request: LegalResearchRequest, user_id: str, db: AsyncIOMotorDatabase):
        from app.api.ai.schema import LegalResearchResponse
        # Similar to chat, but with specialized legal research prompt
        case_context = ""
        if request.case_id:
            try:
                case_doc = await db["cases"].find_one({"$or": [{"case_id": request.case_id}, {"_id": request.case_id}]})
                if case_doc:
                    case_context = f"\n\nContext Case: '{case_doc.get('title')}' (ID: {case_doc.get('case_id')}). Description: {case_doc.get('description')}."
            except Exception:
                pass
                
        system_content = (
            "You are an expert legal research assistant. "
            "You MUST format your response strictly using the following Markdown headers:\n\n"
            "### Summary\n[Provide a concise summary of the legal principles involved]\n\n"
            "### Relevant Sections\n[List relevant statutory sections or constitutional articles]\n\n"
            "### Related Cases\n[Cite and summarize relevant case law]\n\n"
            "### References\n[List any additional legal references or commentary]\n\n"
            "Do not deviate from these headers."
            + case_context
        )
        messages = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": request.query}
        ]
        
        try:
            ai_content = await AIService._call_mistral(messages, PRIMARY_MODEL)
        except HTTPException as e:
            logger.warning(f"Primary model failed: {e.detail}. Attempting backup model.")
            try:
                ai_content = await AIService._call_mistral(messages, BACKUP_MODEL)
            except HTTPException as fallback_e:
                raise fallback_e
        except Exception as e:
            logger.error("Unexpected error in legal research.", exc_info=True)
            raise HTTPException(status_code=500, detail="Unexpected error generating research.")
            
        return LegalResearchResponse(research_results=ai_content)

    @staticmethod
    async def get_conversations(user_id: str, db: AsyncIOMotorDatabase):
        from app.api.ai.schema import ConversationListResponse, ConversationItem
        from pymongo import DESCENDING
        
        cursor = db["chats"].find({"user_id": user_id}).sort("updated_at", DESCENDING).limit(50)
        
        conversations = []
        async for doc in cursor:
            # Derive title from first user message if available
            title = "New Conversation"
            messages = doc.get("messages", [])
            for m in messages:
                if m.get("role") == "user":
                    content = m.get("content", "")
                    title = content[:40] + ("..." if len(content) > 40 else "")
                    break
                    
            conversations.append(ConversationItem(
                id=doc.get("conversation_id"),
                title=title,
                created_at=doc.get("created_at"),
                updated_at=doc.get("updated_at")
            ))
            
        return ConversationListResponse(conversations=conversations)
