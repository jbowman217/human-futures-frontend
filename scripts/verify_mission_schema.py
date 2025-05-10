import os
from dotenv import load_dotenv
from supabase import create_client, Client

# ✅ Load env from one level up
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Supabase environment variables not loaded. Check .env.local")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# What we expect in each mission
EXPECTED_FIELDS = {
    "title": str,
    "grade_band": str,
    "subjects": list,
    "driving_question": str,
    "short_background_context": str,
    "tasks": list,
    "pre_thinking_prompts": list,
    "reflection_prompt": str,
    "ai_tutor_prompts": list,
    "remix_zone": str,
    "display": dict,
}

def verify_schema():
    print("🔍 Verifying Supabase `missions` schema...\n")

    try:
        res = supabase.table("missions").select("*").limit(1).execute()
        if res.error:
            print("❌ Supabase error:", res.error)
            return

        if not res.data:
            print("⚠️ No mission data found.")
            return

        mission = res.data[0]
        issues = 0

        for key, expected_type in EXPECTED_FIELDS.items():
            value = mission.get(key)
            if value is None:
                print(f"❌ Missing field: `{key}`")
                issues += 1
            elif not isinstance(value, expected_type):
                print(f"⚠️ `{key}` type is {type(value).__name__}, expected {expected_type.__name__}")
                issues += 1
            else:
                print(f"✅ `{key}` looks good")

        if issues == 0:
            print("\n✅ Schema looks perfect!")
        else:
            print(f"\n⚠️ Schema had {issues} issue(s). Fix before syncing materials.")
    except Exception as e:
        print("❌ Script error:", str(e))

if __name__ == "__main__":
    verify_schema()
