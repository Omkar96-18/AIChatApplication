from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from ..database.models import get_db, User, ChatMessage, ChatSession
from ..database.db import (
    create_new_chat,
    create_new_session,
    create_new_user,
)
from ..utils.security import hash_password, verify_password
from ..chatbot.ai_model import (
    AIResponseGenerator
)
from typing import Optional, List
from datetime import datetime
from ..utils.authentication import create_access_token, verify_access_token, get_current_user

router = APIRouter()


class UserRegisterResponse(BaseModel):
    message: str
    user_id: int
    user_name: str
    user_email_id: str

class UserRegister(BaseModel):
    user_name: str
    user_email_id: EmailStr
    user_password: str

@router.post("/register", response_model=UserRegisterResponse)
async def register_user(
        req: UserRegister, 
        db: Session = Depends(get_db)
    ):
    existing_user = db.query(User).filter(User.user_email_id == req.user_email_id).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = create_new_user(
        db=db,
        user_name=req.user_name,
        user_email_id=req.user_email_id,
        user_password=hash_password(req.user_password)
    )

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "user_name": user.user_name,
        "user_email_id": user.user_email_id,
    }


class UserLogin(BaseModel):
    user_email_id: EmailStr
    user_password: str

@router.post("/login")
async def login_user(
        req: UserLogin, 
        db: Session=Depends(get_db)
    ):
    user = db.query(User).filter(User.user_email_id == req.user_email_id).first()

    if not user or verify_password(hash_password(req.user_password), user.user_password):
        raise HTTPException(status_code=401, detail="Invalid Credentails")
    
    access_token = create_access_token({"user_id": user.id})
    return {
        "message": "Login successful",
        "user_id": user.id,
        "user_name": user.user_name,
        "access_token": access_token,
        "token_type": "bearer"
    }

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


@router.post("/chat", response_model=ChatResponse)
async def chat(
        req: ChatRequest, 
        db: Session = Depends(get_db), 
        current_user: User = Depends(get_current_user)
    ):

    req.user_id = current_user.id

    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if req.session_id:
        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == req.session_id,
                ChatSession.user_id == user.id
            )
            .first()
        )
        if session is None:
            session = create_new_session(
                db=db,
                title="Chat "+ datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                user_id=user.id
            )
    else:
        session = create_new_session(
            db=db, 
            title="Chat "+ datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            user_id=user.id
        )
    create_new_chat(
        db=db,
        session_id=session.id,
        sender='user',
        message=req.message,
        urls=[]
    )

    result = AIResponseGenerator(req)

    create_new_chat(
        db=db,
        session_id=session.id,
        sender='ai',
        message=result["answer"],
        urls=result["urls"]
    )

    return ChatResponse(
        response=result["answer"],
        sources=result["urls"],
        session_id=session.id
    )

@router.get("/users/{user_id}")
async def get_user_details(
        user_id: int, 
        db:Session = Depends(get_db), 
        current_user: User = Depends(get_current_user)
    ):

    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user.id,
        "user_name": user.user_name,
        "user_email_id": user.user_email_id
    }


@router.get("/users/{user_id}/sessions")
async def get_user_sessions(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):

    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not Authorized")
    
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(ChatSession.created_at.desc()).all()
    result = []

    for s in sessions:
        result.append({
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at,
            "last_message": s.messages[-1].message if s.messages else ""
        })

    return result

@router.get("/users/{user_id}/sessions/{session_id}")
async def get_sessions_messages(
    user_id:int,
    session_id:int,
    db:Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = db.query(ChatMessage).filter(
        ChatSession.user_id == current_user.id,
        ChatMessage.session_id == session_id
        ).all()
    
    return [
        {
            "id":m.id,
            "sender":m.sender,
            "text":m.message,
            "urls":m.urls.split(",") if m.urls else None,
            "created_at": m.created_at
        } for m in messages
    ]

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not Found")
    
    db.delete(user)
    db.commit()

    return {
        "message": "User deleted Successfully",
        "user_id": user_id
    }

@router.delete("/users/{user_id}/sessions/{session_id}")
async def delete_user_sessions(
    user_id:int,
    session_id: int,
    db:Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session = db.query(ChatSession).filter(ChatSession.user_id == user_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()

    return {
        "message": "Session deleted Successfully",
        "session_id": session_id
    }
        


    