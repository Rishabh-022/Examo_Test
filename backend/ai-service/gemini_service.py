import os
import json
from groq import Groq
from dotenv import load_dotenv

# Force Python to read the .env file
load_dotenv()

# Safely grab the Groq API key
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("❌ GROQ_API_KEY is missing! Please check your .env file.")

# Initialize the Groq client
client = Groq(api_key=api_key)

def generate_questions(text: str, subject: str, class_level: int, board: str, chapter_name: str, num_questions=10):
    prompt = f"""
    You are an expert ICSE/CBSE exam question generator.
    
    Given the following textbook content for:
    - Board: {board}
    - Class: {class_level}
    - Subject: {subject}
    - Chapter: {chapter_name}

    Generate exactly {num_questions} multiple-choice questions.
    Each question must have exactly 4 options and one correct answer.
    Assign a difficulty level: "easy", "medium", or "hard".

    You MUST return ONLY a valid JSON object containing a single key "questions" with the array inside.
    Format:
    {{
      "questions": [
        {{
          "questionText": "...",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "correct_option_text",
          "difficulty": "medium"
        }}
      ]
    }}

    Now generate questions from this text:
    {text[:8000]}
    """
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",

        response_format={"type": "json_object"} 
    )
    
    raw = response.choices[0].message.content.strip()
    data = json.loads(raw)
    
    # Return just the array of questions so your db_inserter.py works normally
    return data["questions"]