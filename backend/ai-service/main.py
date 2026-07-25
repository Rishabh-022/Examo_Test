import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pdf_extractor import extract_text_from_pdf
from gemini_service import generate_questions
from db_inserter import insert_questions
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["eduquest"]          
chapters_col = db["chapters"]

class GenerateRequest(BaseModel):
    pdf_path: str
    chapter_id: str
    subject: str
    class_level: int
    board: str
    chapter_name: str
    num_questions: int = 10

@app.post("/generate-questions")
async def generate(request: GenerateRequest):

    try:
        chapter = chapters_col.find_one({"_id": ObjectId(request.chapter_id)})
        if not chapter:
            raise HTTPException(status_code=404, detail="Chapter not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Chapter ID format")

    try:
        text = extract_text_from_pdf(request.pdf_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from PDF")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Extraction failed: {str(e)}")

    questions = generate_questions(
        text=text,
        subject=request.subject,
        class_level=request.class_level,
        board=request.board,
        chapter_name=request.chapter_name,
        num_questions=request.num_questions
    )

    if not questions:
         raise HTTPException(status_code=500, detail="Failed to generate questions from AI")

    insert_questions(request.chapter_id, questions)

    return {
        "message": "Successfully generated and saved questions to MongoDB!",
        "chapter_id": request.chapter_id,
        "total_inserted": len(questions)
    }