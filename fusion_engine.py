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

# Load environment and OpenAI Key
load_dotenv(dotenv_path="./.env")
openai.api_key = os.getenv("OPENAI_API_KEY")

PDF_FOLDER = "./pdfs"
OUTPUT_FOLDER = "./fused_missions"

# Keyword map for subject tagging
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
                text += page_text + "\n"
    return text

def safe_openai_call(*args, retries=3, delay=10, **kwargs):
    for attempt in range(retries):
        try:
            return openai.ChatCompletion.create(*args, **kwargs)
        except openai.error.RateLimitError as e:
            print(f"⚠️ Rate limit hit. Retrying in {delay}s...")
            time.sleep(delay)
    raise RuntimeError("Exceeded retries for OpenAI API call.")

def generate_mission(text, subjects):
    system_prompt = "You are an expert curriculum designer creating missions for high school students."
    user_prompt = f"""
Using the real-world source below, create a JSON mission with:
- title
- grade_band
- subjects (use these detected: {subjects})
- driving_question
- short background context (200-300 words)
- tasks (3 rigorous tasks)
- pre_thinking_prompts (capture initial student ideas/questions)
- reflection_prompt (self-assess learning)
- ai_tutor_prompts (Socratic pushbacks)
- remix_zone (how students could remix problem)
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
        return json.loads(content)
    except json.JSONDecodeError as e:
        print("❌ JSON parsing error:", e)
        print("Raw response:\n", content)
        raise

def run_fusion_engine():
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    for filename in os.listdir(PDF_FOLDER):
        if filename.endswith(".pdf"):
            print(f"🔍 Processing: {filename}")
            pdf_path = os.path.join(PDF_FOLDER, filename)
            text = extract_text_from_pdf(pdf_path)
            subjects = detect_subjects(text)

            print(f"📚 Detected Subjects: {subjects}")
            print(f"📝 Extracted {len(text)} characters from PDF")

            try:
                mission_json = generate_mission(text, subjects)
                safe_title = slugify(mission_json.get("title", "mission"))
                output_filename = f"{safe_title}_{uuid.uuid4().hex[:6]}.json"
                with open(os.path.join(OUTPUT_FOLDER, output_filename), "w") as f:
                    json.dump(mission_json, f, indent=2)
                print(f"✅ Saved: {output_filename}\n")
            except Exception as e:
                print(f"❌ Failed on {filename}: {str(e)}\n")

if __name__ == "__main__":
    run_fusion_engine()
