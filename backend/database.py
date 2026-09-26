import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from supabase import create_client, Client
from typing import Optional

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Optional[Client] = None
if SUPABASE_URL and (SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY):
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client: {e}")
        supabase = None

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Local / Mock mode if no valid DB URL is provided
DB_URL = os.getenv("DATABASE_URL", "")
USE_MOCK_DB = DB_URL == "" or DB_URL.startswith("postgresql+asyncpg://placeholder")

# Fallback to SQLite for local mock
if DB_URL == "":
    DB_URL = "sqlite+aiosqlite:///./studybuddy.db"
elif DB_URL.startswith("postgresql://"):
    DB_URL = DB_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DB_URL, echo=False, future=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
