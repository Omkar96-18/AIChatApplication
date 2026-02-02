from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./chat.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
    )

Base = declarative_base()

class User(Base):
    __tablename__="users"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False)
    user_email_id = Column(String, unique=True, index=True, nullable=False)
    user_password = Column(String, nullable=False)
    create_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship(
        "ChatSession",
        back_populates="user",
        cascade="all, delete"
    )

class ChatSession(Base):
    __tablename__= "sessions"

    user_id=Column(Integer, ForeignKey("users.id"))
    
    id=Column(Integer, primary_key=True, index=True)
    title= Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")

    messages = relationship(
        "ChatMessage",
        back_populates="session",
        order_by="ChatMessage.created_at",
        cascade="all, delete"
        )
    
class ChatMessage(Base):
    __tablename__ = "messages"

    id=Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    sender=Column(String)
    message=Column(Text)
    urls=Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship(
        "ChatSession",
        back_populates="messages"
    )

Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db=SessionLocal()

    try:
        yield db
    finally:
        db.close()