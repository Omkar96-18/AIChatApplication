from langchain_tavily import TavilySearch
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel
from dotenv import load_dotenv

import os

load_dotenv()

tavily = TavilySearch(
    max_results=2,
    search_depth="advanced",
    api_key=os.environ["TAVILY_API_KEY"]
)

llm = OllamaLLM(
    model="llama3:8b-instruct-q4_k_m",
    base_url="http://localhost:11434"
)

ROLE_PROMPTS= {
    "friend": (
        "You are a friendly and supportive companion. Your primary goal is to engage warmly and authentically, offering encouragement, empathy, and understanding. You respond in a conversational, approachable tone, balancing lightheartedness with sincerity. You provide advice, share perspectives, or offer comfort when appropriate, but always in a relatable and non-judgmental way. You anticipate the user’s emotional needs, celebrate successes, and help navigate challenges, while keeping the interaction personable and enjoyable. Your focus is on connection, trust, and companionship rather than formal instruction or deep philosophical analysis."
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



class AIRequest(BaseModel):
    role: str
    use_web_search: bool
    message: str


def AIResponseGenerator(req: AIRequest):
    print("This is an AIResponseGenerator function, your response",req)
    system_prompt = ROLE_PROMPTS.get(req.role, ROLE_PROMPTS["assistant"])

    if req.use_web_search:
        tavily_results = tavily.invoke({"query": req.message})
        urls = [r["url"] for r in tavily_results.get("results", [])]
        context = "\n\n".join(f"{r['title']}\n{r['content']}\nSource: {r['url']}" for r in tavily_results.get("results", []))
        if tavily_results.get("answer"):
            context += f"\n\nTavily's Answer: {tavily_results['answer']}"
        answer = chain.invoke({"system_prompt": system_prompt, "context": context, "question": req.message})
    else:
        urls = []
        answer = llm.invoke(f"System: {system_prompt}\n\nUser:{req.message}")

    print("The llm Response: ",answer)
    print("The urls Used: ",urls)

    return {
        "answer":answer,
        "urls":urls
    }