from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .models import (
    User, ChatSession, ChatMessage, get_db
)
from typing import List
import json


def create_new_user(
        db: Session,
        user_name: str,
        user_email_id: str,
        user_password: str
):
    user = User(
        user_name=user_name,
        user_email_id=user_email_id,
        user_password=user_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def create_new_session(
        db: Session,
        title:str,
        user_id:int      
):
    session = ChatSession(
        title=title,
        user_id=user_id
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return session


def create_new_chat(
    db:Session,
    session_id: int,
    sender: str,
    message: str,
    urls: List[str] = None    
):
    if urls is None:
        urls= []
        
    chat = ChatMessage(
        session_id=session_id,
        sender=sender,
        message=message,
        urls=json.dumps(urls)
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat









