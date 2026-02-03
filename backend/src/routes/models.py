from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserRegisterResponse(BaseModel):
    message: str
    user_id: int
    user_name: str
    user_email_id: str

class UserRegister(BaseModel):
    user_name: str
    user_email_id: EmailStr
    user_password: str

class UserLogin(BaseModel):
    user_email_id: EmailStr
    user_password: str

class ChatResponse(BaseModel) :
    response: str
    urls: List[str] = []
    session_id: int


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None
    user_id: int
    use_web_search: bool = False
    role: str = "assistant"