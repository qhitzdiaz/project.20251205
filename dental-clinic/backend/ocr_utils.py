"""
OCR Utilities for Document Processing
Extract text from PDFs and images using Tesseract OCR
"""

import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import PyPDF2
import os
import tempfile

def extract_text_from_image(image_path):
    """
    Extract text from an image file using OCR

    Args:
        image_path: Path to the image file

    Returns:
        Extracted text as string
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return ""

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file using OCR
    First tries to extract native text, then falls back to OCR for scanned PDFs

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Extracted text as string
    """
    extracted_text = ""

    try:
        # First, try to extract native text from PDF
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                if text.strip():
                    extracted_text += f"\n--- Page {page_num + 1} ---\n{text}"

        # If no text was extracted, it's likely a scanned PDF - use OCR
        if not extracted_text.strip():
            print("No native text found, using OCR...")
            extracted_text = extract_text_from_pdf_with_ocr(pdf_path)

    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        # Fallback to OCR
        try:
            extracted_text = extract_text_from_pdf_with_ocr(pdf_path)
        except Exception as ocr_error:
            print(f"OCR fallback also failed: {ocr_error}")
            return ""

    return extracted_text.strip()

def extract_text_from_pdf_with_ocr(pdf_path):
    """
    Extract text from a scanned PDF using OCR
    Converts PDF pages to images and runs OCR on each

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Extracted text as string
    """
    extracted_text = ""

    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=300)

        # Run OCR on each page
        for page_num, image in enumerate(images, start=1):
            text = pytesseract.image_to_string(image)
            if text.strip():
                extracted_text += f"\n--- Page {page_num} (OCR) ---\n{text}"

    except Exception as e:
        print(f"Error in OCR processing: {e}")
        raise

    return extracted_text.strip()

def extract_text_from_file(file_path):
    """
    Smart text extraction - automatically detects file type

    Args:
        file_path: Path to the file

    Returns:
        dict with extracted text and metadata
    """
    file_extension = os.path.splitext(file_path)[1].lower()

    result = {
        'text': '',
        'method': '',
        'pages': 0,
        'success': False,
        'error': None
    }

    try:
        if file_extension == '.pdf':
            result['text'] = extract_text_from_pdf(file_path)
            result['method'] = 'PDF extraction with OCR fallback'
            # Count pages
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                result['pages'] = len(pdf_reader.pages)

        elif file_extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif']:
            result['text'] = extract_text_from_image(file_path)
            result['method'] = 'Image OCR'
            result['pages'] = 1

        else:
            result['error'] = f'Unsupported file type: {file_extension}'
            return result

        result['success'] = True

    except Exception as e:
        result['error'] = str(e)
        result['success'] = False

    return result

def get_document_info(file_path):
    """
    Get detailed information about a document

    Args:
        file_path: Path to the document

    Returns:
        dict with document information
    """
    info = {
        'file_name': os.path.basename(file_path),
        'file_size': os.path.getsize(file_path),
        'file_type': os.path.splitext(file_path)[1].lower(),
        'pages': 0,
        'has_text': False
    }

    try:
        if info['file_type'] == '.pdf':
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                info['pages'] = len(pdf_reader.pages)
                # Check if PDF has text
                for page in pdf_reader.pages:
                    if page.extract_text().strip():
                        info['has_text'] = True
                        break
        else:
            info['pages'] = 1
            info['has_text'] = False  # Images need OCR

    except Exception as e:
        print(f"Error getting document info: {e}")

    return info
