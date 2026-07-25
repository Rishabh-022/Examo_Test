from pypdf import PdfReader
import io

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Opens a PDF file from disk and returns all extracted text.
    """
    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
        return full_text
    except Exception as e:
        raise Exception(f"Failed to parse PDF: {str(e)}")