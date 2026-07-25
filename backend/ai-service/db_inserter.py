import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId

load_dotenv()

def insert_questions(chapter_id: str, questions: list):
    client = MongoClient(os.getenv("MONGO_URI"))
    # ✅ Fixed: Now pointing to your actual "exam" database!
    db = client["exam"]
    collection = db["questions"]

    docs = []
    for q in questions:
        q["chapterId"] = ObjectId(chapter_id)
        docs.append(q)
    
    if docs:
        collection.insert_many(docs)
        print(f"✅ Inserted {len(docs)} questions for chapter {chapter_id}")
    else:
        print("⚠️ No questions to insert")