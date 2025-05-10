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
import re
import json
import uuid
import time
from PyPDF2 import PdfReader
from dotenv import load_dotenv
import openai
from supabase import create_client, Client

# Load environment
load_dotenv(dotenv_path="./.env")
openai.api_key = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

PDF_FOLDER = "./pdfs"
OUTPUT_FOLDER = "./fused_missions"
ERROR_LOG = "fusion_errors.log"

SUBJECT_KEYWORDS = {
    "algebra": ["slope", "linear", "equation", "variable", "function", "rate"],
    "geometry": ["area", "volume", "angle", "triangle", "circle", "coordinate"],
    "statistics": ["mean", "median", "probability", "survey", "standard deviation"],
    "climate": ["carbon", "climate", "pollution", "emissions", "sustainability"],
    "economics": ["wages", "income", "rent", "housing", "employment", "tax"],
    "ethics": ["bias", "justice", "equity", "ethics", "privacy", "fairness"],
    "history": ["civil rights", "revolution", "treaty", "migration", "conflict"],
    "health": ["nutrition", "healthcare", "pandemic", "disease", "mental health"],
}

def slugify(text):
    return re.sub(r'[^a-zA-Z0-9_-]', '', text.replace(" ", "_")).lower()

def detect_subjects(text):
    detected = set()
    text_lower = text.lower()
    for subject, keywords in SUBJECT_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            detected.add(subject.capitalize())
    return list(detected) or ["Interdisciplinary"]

def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, "rb") as f:
        reader = PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                cleaned = re.sub(r'Page \d+ of \d+|\n{2,}', '\n', page_text)
                text += cleaned + "\n"
    return text

def safe_openai_call(*args, retries=3, delay=10, **kwargs):
    for attempt in range(retries):
        try:
            return openai.ChatCompletion.create(*args, **kwargs)
        except openai.error.RateLimitError:
            print(f"⚠️ Rate limit hit. Retrying in {delay}s...")
            time.sleep(delay)
    raise RuntimeError("Exceeded retries for OpenAI API call.")

def generate_mission(text, subjects, filename):
    system_prompt = "You are an expert curriculum designer creating missions for high school students."
    user_prompt = f"""
Using the real-world source below, create a JSON mission with:
- title
- grade_band
- subjects (use these detected: {subjects})
- driving_question
- short background context (200-300 words)
- tasks (3 rigorous tasks)
- pre_thinking_prompts (initial student ideas/questions)
- reflection_prompt (self-assess learning)
- ai_tutor_prompts (Socratic pushbacks)
- remix_zone (how students remix the problem)
- display (components: graph builder, text area)

Source text:
{text[:4000]}
"""

    response = safe_openai_call(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.4
    )

    content = response.choices[0].message["content"]
    try:
        mission = json.loads(content)
        mission["_source_pdf"] = filename
        return mission
    except json.JSONDecodeError as e:
        print("❌ JSON parsing error:", e)
        print("Raw response:\n", content)
        raise

def upload_to_supabase(mission):
    payload = {
        "title": mission.get("title"),
        "grade_band": mission.get("grade_band"),
        "subjects": mission.get("subjects"),
        "driving_question": mission.get("driving_question"),
        "short_background_context": mission.get("short_background_context"),
        "tasks": mission.get("tasks"),
        "pre_thinking_prompts": mission.get("pre_thinking_prompts"),
        "reflection_prompt": mission.get("reflection_prompt"),
        "ai_tutor_prompts": mission.get("ai_tutor_prompts"),
        "remix_zone": mission.get("remix_zone"),
        "display": mission.get("display")
    }
    result = supabase.table("missions").insert(payload).execute()
    return result

def run_fusion_engine():
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    with open(ERROR_LOG, "w") as error_log:
        for i, filename in enumerate(os.listdir(PDF_FOLDER), 1):
            if not filename.endswith(".pdf"):
                continue

            print(f"\n🔢 {i}. Processing: {filename}")
            pdf_path = os.path.join(PDF_FOLDER, filename)

            try:
                text = extract_text_from_pdf(pdf_path)
                subjects = detect_subjects(text)
                print(f"📚 Subjects: {subjects}")
                print(f"📝 Extracted {len(text)} characters")

                mission = generate_mission(text, subjects, filename)

                # Save to disk
                safe_title = slugify(mission.get("title", "mission"))
                output_filename = f"{safe_title}_{uuid.uuid4().hex[:6]}.json"
                output_path = os.path.join(OUTPUT_FOLDER, output_filename)

                with open(output_path, "w") as f:
                    json.dump(mission, f, indent=2)

                print(f"✅ Saved: {output_filename}")

                # Upload to Supabase
                upload_result = upload_to_supabase(mission)
                if upload_result.error:
                    raise Exception(upload_result.error)
                print(f"🚀 Uploaded to Supabase: {mission['title']}")
            except Exception as e:
                error_msg = f"{filename}: {str(e)}\n"
                error_log.write(error_msg)
                print(f"❌ Failed on {filename}: {str(e)}")

if __name__ == "__main__":
    run_fusion_engine()
