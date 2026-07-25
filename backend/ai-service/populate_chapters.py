import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pdf_extractor import extract_text_from_pdf

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["exam"]          # Your database name
chapters_col = db["chapters"]

PDF_ROOT = r"C:\Users\ss v\Desktop\exam\backend\ai-service\pdfs"

def get_theory(text, max_chars=500):
    return text[:max_chars].strip() if text else ""

def populate():
    count = 0
    print("🚀 Scanning folders and pushing to MongoDB...")
    
    for folder_name in os.listdir(PDF_ROOT):
        folder_path = os.path.join(PDF_ROOT, folder_name)
        if not os.path.isdir(folder_path):
            continue

        # Parse the new folder name separated by underscores (e.g., "CBSE_Class11_Chemistry_Part1")
        parts = folder_name.split("_")
        if len(parts) < 3:
            continue # Skip weirdly named folders

        board = parts[0]
        try:
            # Extracts the number "10" from "Class10"
            class_level = int(parts[1].replace("Class", ""))
        except ValueError:
            continue
        
        # Grabs the subject and any "Part1" suffixes
        subject = " ".join(parts[2:]) 

        # Loop through the PDFs in this folder
        for pdf_file in os.listdir(folder_path):
            if not pdf_file.lower().endswith(".pdf"):
                continue
            
            pdf_path = os.path.join(folder_path, pdf_file)
            chapter_name = os.path.splitext(pdf_file)[0].replace("_", " ") # Converts "Chapter_1" to "Chapter 1"
            
            # Check if it already exists in DB so we don't duplicate
            existing = chapters_col.find_one({
                "board": board,
                "classLevel": class_level,
                "subject": subject,
                "chapterName": chapter_name
            })
            
            if existing:
                print(f"⏭️  Already exists: {board} Class {class_level} {subject} - {chapter_name}")
                continue

            # Extract text
            try:
                text = extract_text_from_pdf(pdf_path)
                theory = get_theory(text)
            except Exception as e:
                print(f"⚠️  Could not extract text from {pdf_file}: {e}")
                theory = ""

            # Extract the actual number from "Chapter 1"
            try:
                chap_num = int(chapter_name.replace("Chapter ", ""))
            except:
                chap_num = 1 # Fallback

            doc = {
                "board": board,
                "classLevel": class_level,
                "subject": subject,
                "chapterNumber": chap_num,
                "chapterName": chapter_name,
                "theoryNotes": theory
            }
            
            chapters_col.insert_one(doc)
            print(f"✅ Inserted: {board} Class {class_level} {subject} - {chapter_name}")
            count += 1
            
    print(f"\n🎉 Done. {count} new chapters added to MongoDB.")

if __name__ == "__main__":
    populate()