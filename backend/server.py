from fastapi import FastAPI, APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import asyncio

# Import our modules
from database import get_db, create_tables
from models import Script, Character, Scene, Panel, GenerationJob
from script_parser import ScriptParser
from stable_diffusion import StableDiffusionGenerator

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create database tables
create_tables()

# Initialize services
script_parser = ScriptParser()
sd_generator = StableDiffusionGenerator()

# Create the main app without a prefix
app = FastAPI(title="Manga Creator API", version="1.0.0")

# Mount static files for generated images
images_dir = Path("./generated_images")
images_dir.mkdir(exist_ok=True)
app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models for API
class ScriptCreate(BaseModel):
    title: str
    content: str
    style: str = "shounen"

class ScriptResponse(BaseModel):
    id: str
    title: str
    content: str
    style: str
    parsed_data: Optional[Dict[str, Any]]
    created_at: datetime

class CharacterCreate(BaseModel):
    name: str
    description: str
    tags: List[str] = []
    image_ref: Optional[str] = None

class CharacterResponse(BaseModel):
    id: str
    name: str
    description: str
    tags: List[str]
    image_ref: Optional[str]
    created_at: datetime

class GenerationRequest(BaseModel):
    script_id: str
    style: str = "shounen"
    options: Dict[str, Any] = {}

class GenerationStatusResponse(BaseModel):
    id: str
    status: str
    progress: float
    total_panels: Optional[int]
    completed_panels: int
    result_data: Optional[Dict[str, Any]]
    error_message: Optional[str]

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Manga Creator API", "version": "1.0.0"}

# Script Management
@api_router.post("/scripts/parse", response_model=ScriptResponse)
async def parse_script(script_data: ScriptCreate, db: Session = Depends(get_db)):
    """Parse and save a manga script"""
    try:
        # Parse script content
        parsed_data = script_parser.parse_script(script_data.content)
        
        # Create script record
        script = Script(
            title=script_data.title,
            content=script_data.content,
            style=script_data.style,
            parsed_data=parsed_data
        )
        
        db.add(script)
        db.commit()
        db.refresh(script)
        
        # Create scene records
        for scene_data in parsed_data['scenes']:
            scene = Scene(
                script_id=script.id,
                order=scene_data['order'],
                scene_type=scene_data['scene_type'],
                characters=scene_data['characters'],
                dialogue=[d['text'] for d in scene_data['dialogue']],
                action=', '.join(scene_data['actions']),
                location=scene_data['location'],
                mood=scene_data['mood']
            )
            db.add(scene)
        
        db.commit()
        
        return ScriptResponse(
            id=script.id,
            title=script.title,
            content=script.content,
            style=script.style,
            parsed_data=script.parsed_data,
            created_at=script.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error parsing script: {str(e)}")

@api_router.get("/scripts", response_model=List[ScriptResponse])
async def get_scripts(db: Session = Depends(get_db)):
    """Get all scripts"""
    scripts = db.query(Script).order_by(Script.created_at.desc()).all()
    return [ScriptResponse(
        id=script.id,
        title=script.title,
        content=script.content,
        style=script.style,
        parsed_data=script.parsed_data,
        created_at=script.created_at
    ) for script in scripts]

@api_router.get("/scripts/{script_id}", response_model=ScriptResponse)
async def get_script(script_id: str, db: Session = Depends(get_db)):
    """Get specific script"""
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    return ScriptResponse(
        id=script.id,
        title=script.title,
        content=script.content,
        style=script.style,
        parsed_data=script.parsed_data,
        created_at=script.created_at
    )

# Character Management
@api_router.post("/characters", response_model=CharacterResponse)
async def create_character(character_data: CharacterCreate, db: Session = Depends(get_db)):
    """Create new character"""
    character = Character(
        name=character_data.name,
        description=character_data.description,
        tags=character_data.tags,
        image_ref=character_data.image_ref
    )
    
    db.add(character)
    db.commit()
    db.refresh(character)
    
    return CharacterResponse(
        id=character.id,
        name=character.name,
        description=character.description,
        tags=character.tags or [],
        image_ref=character.image_ref,
        created_at=character.created_at
    )

@api_router.get("/characters", response_model=List[CharacterResponse])
async def get_characters(db: Session = Depends(get_db)):
    """Get all characters"""
    characters = db.query(Character).order_by(Character.created_at.desc()).all()
    return [CharacterResponse(
        id=character.id,
        name=character.name,
        description=character.description,
        tags=character.tags or [],
        image_ref=character.image_ref,
        created_at=character.created_at
    ) for character in characters]

@api_router.delete("/characters/{character_id}")
async def delete_character(character_id: str, db: Session = Depends(get_db)):
    """Delete character"""
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    db.delete(character)
    db.commit()
    return {"success": True}

# Panel Generation
@api_router.post("/generate/panel")
async def generate_panel(scene_data: Dict[str, Any], style: str = "shounen"):
    """Generate individual manga panel"""
    try:
        result = sd_generator.generate_panel(scene_data, style)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating panel: {str(e)}")

# Background task for manga generation
async def generate_manga_task(job_id: str, script_id: str, style: str, db_session):
    """Background task to generate full manga"""
    try:
        # Get job and script
        job = db_session.query(GenerationJob).filter(GenerationJob.id == job_id).first()
        script = db_session.query(Script).filter(Script.id == script_id).first()
        
        if not job or not script:
            return
        
        # Update job status
        job.status = "processing"
        db_session.commit()
        
        # Get scenes
        scenes = db_session.query(Scene).filter(Scene.script_id == script_id).order_by(Scene.order).all()
        job.total_panels = len(scenes)
        db_session.commit()
        
        generated_panels = []
        
        # Generate each panel
        for i, scene in enumerate(scenes):
            try:
                scene_data = {
                    'id': scene.id,
                    'characters': scene.characters,
                    'actions': scene.action.split(', ') if scene.action else [],
                    'dialogue': [{'text': d} for d in scene.dialogue] if scene.dialogue else [],
                    'location': scene.location,
                    'mood': scene.mood,
                    'scene_type': scene.scene_type
                }
                
                # Generate panel
                panel_result = sd_generator.generate_panel(scene_data, style)
                
                # Save panel record
                panel = Panel(
                    scene_id=scene.id,
                    image_url=panel_result['image_url'],
                    prompt_used=panel_result['prompt_used'],
                    generation_metadata=panel_result.get('generation_metadata', {})
                )
                
                db_session.add(panel)
                generated_panels.append({
                    'panel_id': panel.id,
                    'scene_id': scene.id,
                    'image_url': panel_result['image_url'],
                    'prompt': panel_result['prompt_used']
                })
                
                # Update progress
                job.completed_panels = i + 1
                job.progress = (i + 1) / len(scenes)
                db_session.commit()
                
                # Small delay to prevent overwhelming the system
                await asyncio.sleep(1)
                
            except Exception as e:
                logging.error(f"Error generating panel for scene {scene.id}: {str(e)}")
                continue
        
        # Complete job
        job.status = "completed"
        job.progress = 1.0
        job.result_data = {"panels": generated_panels}
        db_session.commit()
        
    except Exception as e:
        # Mark job as failed
        job.status = "failed"
        job.error_message = str(e)
        db_session.commit()
        logging.error(f"Error in manga generation task: {str(e)}")
    finally:
        db_session.close()

@api_router.post("/generate/manga")
async def start_manga_generation(
    request: GenerationRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start full manga generation job"""
    # Verify script exists
    script = db.query(Script).filter(Script.id == request.script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    # Create generation job
    job = GenerationJob(
        script_id=request.script_id,
        status="pending"
    )
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Start background task
    background_tasks.add_task(generate_manga_task, job.id, request.script_id, request.style, db)
    
    return {
        "job_id": job.id,
        "status": "started",
        "message": "Manga generation started in background"
    }

@api_router.get("/generate/status/{job_id}", response_model=GenerationStatusResponse)
async def get_generation_status(job_id: str, db: Session = Depends(get_db)):
    """Get manga generation status"""
    job = db.query(GenerationJob).filter(GenerationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return GenerationStatusResponse(
        id=job.id,
        status=job.status,
        progress=job.progress or 0.0,
        total_panels=job.total_panels,
        completed_panels=job.completed_panels or 0,
        result_data=job.result_data,
        error_message=job.error_message
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
