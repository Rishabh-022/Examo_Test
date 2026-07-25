import os
import time
from pymongo import MongoClient
from bson.objectid import ObjectId  # <-- Added this!
from dotenv import load_dotenv
from pdf_extractor import extract_text_from_pdf
from gemini_service import generate_questions
from db_inserter import insert_questions

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["exam"]
chapters_col = db["chapters"]
questions_col = db["questions"]

PDF_ROOT = r"C:\Users\ss v\Desktop\exam\backend\ai-service\pdfs"

QUESTIONS_PER_CHAPTER = 30
MIN_EXISTING = 20
DELAY_SECONDS = 20

def process():
    print("🚀 Starting AI Batch Generation...")
    
    for folder_name in os.listdir(PDF_ROOT):
        folder_path = os.path.join(PDF_ROOT, folder_name)
        if not os.path.isdir(folder_path):
            continue

        parts = folder_name.split("_")
        if len(parts) < 3:
            continue

        board = parts[0]
        try:
            class_level = int(parts[1].replace("Class", ""))
        except ValueError:
            continue
        subject = " ".join(parts[2:])

        for pdf_file in os.listdir(folder_path):
            if not pdf_file.lower().endswith(".pdf"):
                continue
            
            pdf_path = os.path.join(folder_path, pdf_file)
            chapter_name = os.path.splitext(pdf_file)[0].replace("_", " ")

            chapter = chapters_col.find_one({
                "board": board,
                "classLevel": class_level,
                "subject": subject,
                "chapterName": chapter_name
            })
            
            if not chapter:
                print(f"❌ DB Chapter not found: {board} Class {class_level} {subject} - {chapter_name}")
                continue

            chapter_id = chapter["_id"]

            # ✅ THE BULLETPROOF CHECK
            existing_count = questions_col.count_documents({
                "$or": [
                    {"chapterId": str(chapter_id)},
                    {"chapterId": chapter_id}
                ]
            })
            
            if existing_count >= MIN_EXISTING:
                print(f"⏭️  Skipping (already {existing_count} Qs): {board} Class {class_level} {subject} - {chapter_name}")
                continue

            try:
                text = extract_text_from_pdf(pdf_path)
                if not text.strip():
                    print(f"⚠️  Empty text in {pdf_file}, skipping.")
                    continue
            except Exception as e:
                print(f"❌ Error extracting {pdf_file}: {e}")
                continue

            try:
                print(f"🧠 Generating questions for {board} Class {class_level} {subject} - {chapter_name}...")
                questions = generate_questions(
                    text=text,
                    subject=subject,
                    class_level=class_level,
                    board=board,
                    chapter_name=chapter_name,
                    num_questions=QUESTIONS_PER_CHAPTER
                )
                insert_questions(str(chapter_id), questions)
                print(f"✅ {len(questions)} questions inserted successfully!")
            except Exception as e:
                print(f"❌ Generation failed for {pdf_file}: {e}")

            time.sleep(DELAY_SECONDS)
            
    print("🎉 Batch generation complete!")

if __name__ == "__main__":
    process()