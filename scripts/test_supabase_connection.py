import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Step 1: Load .env.local from one level up
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Supabase environment variables not loaded. Check .env.local")

print("✅ Environment variables loaded.")
print("🔗 SUPABASE_URL =", SUPABASE_URL[:40] + "...")

# Step 2: Connect to Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Step 3: Test a query on the 'missions' table
try:
    response = supabase.table("missions").select("*").limit(3).execute()
    if response.data:
        print("✅ Supabase connection successful. Sample missions:")
        for mission in response.data:
            print("•", mission.get("title", "Untitled Mission"))
    else:
        print("⚠️ Connected, but no mission data returned.")
except Exception as e:
    print("❌ Supabase query failed:", str(e))
