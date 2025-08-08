from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # Raw script content
    style = Column(String, nullable=False)  # shounen, shoujo, etc
    parsed_data = Column(JSON)  # Parsed scenes and structure
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    scenes = relationship("Scene", back_populates="script", cascade="all, delete-orphan")
    generation_jobs = relationship("GenerationJob", back_populates="script")

class Character(Base):
    __tablename__ = "characters"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    tags = Column(JSON)  # Array of tags
    image_ref = Column(String)  # URL or file path
    created_at = Column(DateTime, default=datetime.utcnow)

class Scene(Base):
    __tablename__ = "scenes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    script_id = Column(String, ForeignKey("scripts.id"), nullable=False)
    order = Column(Integer, nullable=False)
    scene_type = Column(String)  # action, dialogue, etc
    characters = Column(JSON)  # Characters in this scene
    dialogue = Column(JSON)  # Array of dialogue
    action = Column(Text)  # Action description
    location = Column(String)  # Scene location
    mood = Column(String)  # Scene mood/emotion
    
    # Relationships
    script = relationship("Script", back_populates="scenes")
    panels = relationship("Panel", back_populates="scene", cascade="all, delete-orphan")

class Panel(Base):
    __tablename__ = "panels"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String, ForeignKey("scenes.id"), nullable=False)
    image_url = Column(String)  # Generated image URL
    prompt_used = Column(Text)  # Stable Diffusion prompt
    generation_metadata = Column(JSON)  # Model, seed, parameters
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scene = relationship("Scene", back_populates="panels")

class GenerationJob(Base):
    __tablename__ = "generation_jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    script_id = Column(String, ForeignKey("scripts.id"), nullable=False)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    progress = Column(Float, default=0.0)  # 0.0 to 1.0
    total_panels = Column(Integer)
    completed_panels = Column(Integer, default=0)
    result_data = Column(JSON)  # Generated panels info
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    script = relationship("Script", back_populates="generation_jobs")