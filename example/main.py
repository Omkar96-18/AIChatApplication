from fastapi import FastAPI, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from langchain_tavily import TavilySearch
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from db import SessionLocal, ChatMessage, ChatSession
import os
from dotenv import load_dotenv
from typing import List, Optional
from datetime import datetime

load_dotenv()

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tavily
tavily = TavilySearch(
    max_results=2,
    search_depth="advanced",
    api_key=os.environ["TAVILY_API_KEY"]
)

# Ollama
llm = OllamaLLM(
    model="llama3:8b-instruct-q4_k_m",
    base_url="http://localhost:11434"
)

ROLE_PROMPTS= {
    "friend": (
        "You are a close, affectionate companion with a witty, playful, and flirtatious nature. You speak casually, warmly, and tenderly, offering emotional support, gentle teasing, and a sense of romantic closeness, like a trusted partner and best friend combined. You prioritize emotional connection before giving advice, and you keep your responses light, caring, and engaging."
    ),

    "assistant": (
        "You are a professional personal assistant. Your primary goal is to help the user in a clear, efficient, and structured manner. You respond logically and concisely, prioritizing clarity, practicality, and usefulness. Your tone is polite, confident, and neutral. You focus on actionable guidance, step-by-step instructions, or solutions to problems, without unnecessary tangents or emotional embellishment. You anticipate needs when possible and organize information for easy understanding."
    ),

    "philosopher": (
        "You are a philosopher. You think deeply and respond thoughtfully, exploring meaning, ethics, reasoning, and the bigger picture. Your responses analyze concepts, challenge assumptions, and reflect multiple perspectives. You prioritize intellectual depth, curiosity, and insight over immediate practical advice. Your tone is reflective, contemplative, and respectful of complex ideas. You often raise questions that encourage further reflection."
    ),

    "poet": (
        "You are a poet. You respond creatively, using expressive and imaginative language, including metaphors, symbolism, and rhythm. Your goal is to evoke emotions, create vivid imagery, and convey ideas in a lyrical way. You do not focus on practicality or step-by-step instructions unless the user requests a poetic perspective. Your tone can vary—playful, melancholic, romantic, or whimsical—but always artistic and evocative."
    )
}


prompt = ChatPromptTemplate.from_template("""
System:
{system_prompt}

You are an AI assistant.
Answer the question using ONLY the web search results below.
If the answer is not found, say "I could not find this information online."

Web results:
{context}

Question:
{question}

Answer:
""")

chain = prompt | llm | StrOutputParser()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None
    use_web_search: bool = False
    role:str = "assistant"

class ChatResponse(BaseModel):
    response: str
    urls: List[str] = []
    session_id: int

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):

    system_prompt = ROLE_PROMPTS.get(req.role, ROLE_PROMPTS["assistant"])

    if req.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == req.session_id).first()
    else:
        session = ChatSession(title="Chat " + datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))
        db.add(session)
        db.commit()
        db.refresh(session)


    # very first code to search
    # tavily_results = tavily.invoke({"query": req.message})

    # urls = [r['url'] for r in tavily_results.get("results", [])]


    # context = "\n\n".join(
    #     f"{r['title']}\n{r['content']}\nSource: {r['url']}"    
    #     for r in tavily_results.get("results", [])
    # )


    # if tavily_results.get("answer"):
    #     context += f"\n\nTavily's Answer: {tavily_results['answer']}"


    # Testing for Only LLM responses
    # urls = []
    # context = ""

    # answer = chain.invoke({
    #     "context": context,
    #     "question": req.message
    # })


    # Second attempt
    
    if req.use_web_search:
        tavily_results = tavily.invoke({"query": req.message})

        urls = [r["url"] for r in tavily_results.get("results", [])]

        context = "\n\n".join(
            f"{r['title']}\n{r['content']}\nSource: {r['url']}"
            for r in tavily_results.get("results", [])
        )

        if tavily_results.get("answer"):
            context += f"\n\nTavily's Answer: {tavily_results['answer']}"

        answer = chain.invoke({
            "system_prompt": system_prompt,
            "context": context,
            "question": req.message
        })

    else:
        urls = []
        answer = llm.invoke(f"System: {system_prompt}\n\nUser:{req.message}")


    user_msg = ChatMessage(session_id=session.id, sender="user", message=req.message)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    if session.title.startswith("Chat "):
        session.title = req.message[:50]
        db.commit()

    ai_msg = ChatMessage(session_id=session.id,sender="ai", message=answer, urls=",".join(urls))
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    print("=== LLM RESPONSE ===")
    print(answer)

    return ChatResponse(response=answer, urls=urls, session_id=session.id)


@app.get("/sessions")
def get_sessions(db:Session = Depends(get_db)):
    sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()
    result = []

    for s in sessions:
        result.append({
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at,
            "last_message": s.messages[-1].message if s.messages else ""
        })

    return result


@app.get("/sessions/{session_id}/messages")
def get_session_messages(session_id: int, db: Session = Depends(get_db)):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)  # ✅ REQUIRED
        .order_by(ChatMessage.created_at)
        .all()
    )

    return [
        {
            "id": m.id,
            "sender": m.sender,
            "text": m.message,
            "urls": m.urls.split(",") if m.urls else [],
            "created_at": m.created_at,
        }
        for m in messages
    ]

