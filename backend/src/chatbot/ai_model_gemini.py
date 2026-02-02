from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
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


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    google_api_key=os.environ["GOOGLE_API_KEY"]
)


ROLE_PROMPTS = {
    "friend": (
        "You are a friendly and supportive companion. Your primary goal is "
        "to engage warmly and authentically, offering encouragement, empathy, "
        "and understanding. You respond in a conversational, approachable tone."
    ),

    "assistant": (
        "You are a professional personal assistant. Your primary goal is to help "
        "the user in a clear, efficient, and structured manner. You respond "
        "logically and concisely."
    ),

    "philosopher": (
        "You are a philosopher. You think deeply and respond thoughtfully, "
        "exploring meaning, ethics, reasoning, and the bigger picture."
    ),

    "poet": (
        "You are a poet. You respond creatively, using expressive and imaginative "
        "language, metaphors, and vivid imagery."
    )
}


prompt = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"),
    ("system",
     "Answer the question using ONLY the web search results below. "
     "If the answer is not found, say exactly: "
     "'I could not find this information online.'"),
    ("human",
     "Web results:\n{context}\n\nQuestion:\n{question}")
])

chain = prompt | llm | StrOutputParser()


class AIRequest(BaseModel):
    role: str
    use_web_search: bool
    message: str


def AIResponseGenerator(req: AIRequest):
    system_prompt = ROLE_PROMPTS.get(req.role, ROLE_PROMPTS["assistant"])

    if req.use_web_search:

        tavily_results = tavily.invoke({"query": req.message})

        context = "\n\n".join(
            f"{r['title']}\n{r['content']}\nSource: {r['url']}"
            for r in tavily_results.get("results", [])
        )

        if tavily_results.get("answer"):
            context += f"\n\nTavily's Answer:\n{tavily_results['answer']}"

 
        answer = chain.invoke({
            "system_prompt": system_prompt,
            "context": context,
            "question": req.message
        })

        urls = [r["url"] for r in tavily_results.get("results", [])]

    else:

        response = llm.invoke([
            ("system", system_prompt),
            ("human", req.message)
        ])
        answer = response.content
        urls = []

    return {
        "answer": answer,
        "urls": urls
    }


if __name__ == "__main__":
    req = AIRequest(
        role="philosopher",
        use_web_search=True,
        message="facts about India"
    )

    result = AIResponseGenerator(req)
    print(result)
