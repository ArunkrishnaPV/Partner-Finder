import os
from dotenv import load_dotenv
from supabase import create_client, Client

from pathlib import Path

# Load .env from backend directory or root directory
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)
load_dotenv()

def get_db() -> Client:
    """Initializes and returns the Supabase client."""
    url: str = os.getenv("SUPABASE_URL", "").strip()
    key: str = os.getenv("SUPABASE_KEY", "").strip()
    
    if not url or not key:
        return None

    if not url.startswith("http://") and not url.startswith("https://"):
        url = f"https://{url}.supabase.co"
        
    return create_client(url, key)
