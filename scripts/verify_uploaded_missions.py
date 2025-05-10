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
from supabase import create_client, Client

# Load environment variables
load_dotenv(dotenv_path="./.env")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def verify_uploaded_missions(limit=20):
    try:
        response = supabase.table("missions") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()

        if response.error:
            print("❌ Supabase fetch error:", response.error)
            return

        data = response.data
        print(f"\n✅ Showing {len(data)} most recent missions:\n")

        for mission in data:
            title = mission.get("title", "[Untitled]")
            grade = mission.get("grade_band", "N/A")
            subjects = mission.get("subjects", [])
            print(f"• {title} | Grade: {grade} | Subjects: {subjects}")

    except Exception as e:
        print(f"❌ Error verifying missions: {str(e)}")

if __name__ == "__main__":
    verify_uploaded_missions()
