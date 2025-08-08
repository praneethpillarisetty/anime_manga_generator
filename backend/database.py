from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
import os

# Get database URL from environment
DATABASE_URL = os.environ.get('MONGO_URL', 'sqlite:///./manga_creator.db')

# For SQLite, we need to use a different URL format
if 'mongodb' in DATABASE_URL:
    # If MongoDB URL is provided, use SQLite instead for this implementation
    DATABASE_URL = 'sqlite:///./manga_creator.db'

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()