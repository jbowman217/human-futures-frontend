import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment
load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

import os
from dotenv import load_dotenv

# Try loading the environment file
load_dotenv(dotenv_path=".env.local")

# Print to verify they load
print("✅ NEXT_PUBLIC_SUPABASE_URL:", os.getenv("NEXT_PUBLIC_SUPABASE_URL"))
print("✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
