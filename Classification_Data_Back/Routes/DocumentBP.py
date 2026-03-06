from flask import Blueprint, request, jsonify, abort, Response
import os
from config import db
from Models.Document import Document
from Models.Categorie import Categorie
from Models.Paragraph import Paragraph
from flask_jwt_extended import jwt_required, get_jwt_identity
import string
import jwt
from docx import Document as DocxDocument
import PyPDF2
from flask import current_app
from flask import send_from_directory, send_file, render_template_string
from functools import wraps
from sqlalchemy import or_, and_, func
from Models.User import User
import mimetypes
import io
import base64
import re

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
Document_bp = Blueprint("document", __name__)
ALLOWED_EXTENSIONS = {"txt", "pdf", "docx"}

# Maximum paragraph size to avoid PostgreSQL index limitation (in characters)
MAX_PARAGRAPH_SIZE = 4000  # Adjust this based on your database configuration

# Minimum paragraph size - paragraphs smaller than this might be titles or headings
MIN_PARAGRAPH_SIZE = 100  # Adjust based on your needs

# Configuration for paragraph extraction
CONFIG = {
    "merge_short_paragraphs": True,  # Merge adjacent short paragraphs
    "min_paragraph_length": 100,  # Minimum length to consider as a full paragraph
    "ignore_single_sentences": True,  # Ignore very short content that might be titles
    "max_paragraph_length": 4000,  # Maximum paragraph length before splitting
    "title_patterns": [  # Regex patterns that might indicate titles
        r"^Chapter \d+",
        r"^Section \d+",
        r"^\d+\.\s+\w+",
        r"^[A-Z\s]+$",  # All uppercase text might be a title
    ],
}


def allowed_file(filename):
    """Check if the file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# 1. Add Document (POST)
@Document_bp.route("/addDocument/", methods=["POST"])
@jwt_required()
def Ajouter():
    print("hello")
    titre = request.form.get("titre")
    auteur = request.form.get("auteur")
    print(titre)
    print("Form Data:", request.form)
    # Check if a file is uploaded
    current_user = get_jwt_identity()
    file = request.files.get("file")
    print(file)
    if not allowed_file(file.filename):
        return (
            jsonify(
                {
                    "error": "Invalid file extension. Only txt, pdf, and docx files are allowed."
                }
            ),
            415,
        )
    if file.filename == "":
        return jsonify({"message": "Aucun fichier sélectionné!"}), 500

    # Save the file to a folder
    upload_folder = os.path.join(os.path.dirname(__file__), "uploads")
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Save the file with a unique name
    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    # Create a new document
    new_document = Document(
        titre=titre, user_id=current_user, file_path=file.filename, auteur=auteur
    )

    db.session.add(new_document)
    db.session.commit()

    # Extract paragraphs based on file type
    try:
        paragraphs = read_file_by_paragraphs(file_path)
        print(f"Number of paragraphs extracted: {len(paragraphs)}")

        # Filter out titles and headings and merge short paragraphs
        processed_paragraphs = filter_and_process_paragraphs(paragraphs)
        print(f"Number of paragraphs after processing: {len(processed_paragraphs)}")

        # Add all processed paragraphs to the database
        for contenu in processed_paragraphs:
            if contenu.strip():  # Only add non-empty paragraphs
                # Split if still too large for database
                if len(contenu) > MAX_PARAGRAPH_SIZE:
                    chunks = split_paragraph(contenu, MAX_PARAGRAPH_SIZE)
                    for chunk in chunks:
                        documentId = new_document.DocumentId
                        newpara = Paragraph(contenu=chunk, documentId=documentId)
                        db.session.add(newpara)
                        try:
                            db.session.commit()
                        except Exception as e:
                            print(f"Error adding paragraph chunk: {str(e)}")
                            db.session.rollback()
                else:
                    documentId = new_document.DocumentId
                    newpara = Paragraph(contenu=contenu, documentId=documentId)
                    db.session.add(newpara)
                    try:
                        db.session.commit()
                        print(f"Added paragraph with ID: {newpara.ParagrapheId}")
                    except Exception as e:
                        print(f"Error adding paragraph: {str(e)}")
                        db.session.rollback()

        return (
            jsonify(
                {
                    "message": f"nouveau document ajouté avec id {new_document.DocumentId}",
                    "paragraphs_count": len(processed_paragraphs),
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Error reading file: {e}")
        return jsonify({"message": f"Error reading the file: {str(e)}"}), 500


def is_likely_title(text):
    """Check if text is likely a title or heading based on patterns"""
    # If it's very short, it might be a title
    if len(text) < 50:
        # Check if it ends with a question mark or period (if not, more likely a title)
        if not text.rstrip().endswith((".", "?", "!")):
            return True

        # Check if it's all caps or title case
        if text.isupper() or text == text.title():
            return True

        # Check for numeric patterns that often indicate headings
        if re.match(
            r"^\d+\.?\s+\w+", text
        ):  # Starts with number like "1. Introduction"
            return True

    # Check against regex patterns that might indicate titles
    for pattern in CONFIG["title_patterns"]:
        if re.match(pattern, text):
            return True

    return False


def filter_and_process_paragraphs(paragraphs):
    """Filter out likely titles and merge short paragraphs"""
    if not paragraphs:
        return []

    result = []
    current_paragraph = ""

    for i, para in enumerate(paragraphs):
        # Skip empty paragraphs
        if not para.strip():
            continue

        # Check if this paragraph is likely a title
        if is_likely_title(para):
            # If we were building a paragraph, add it to results
            if current_paragraph:
                result.append(current_paragraph)
                current_paragraph = ""
            # Skip the title - don't add it
            continue

        # Handle short paragraphs
        if len(para) < CONFIG["min_paragraph_length"]:
            # If configured to merge short paragraphs
            if CONFIG["merge_short_paragraphs"]:
                # If we already have text, append this to it
                if current_paragraph:
                    current_paragraph += " " + para
                else:
                    current_paragraph = para
            else:
                # Don't merge, just add if it's not too short
                if len(para) > 20:  # Arbitrary minimum to avoid single words
                    result.append(para)
        else:
            # This is a normal paragraph
            # If we were building a paragraph, add it to results
            if current_paragraph:
                result.append(current_paragraph)
                current_paragraph = ""
            # Add the current paragraph
            result.append(para)

    # Add any final paragraph we were building
    if current_paragraph:
        result.append(current_paragraph)

    return result


# Helper function to split long paragraphs
def split_paragraph(paragraph, max_size):
    """Split a paragraph into smaller chunks to avoid database index size limits"""
    if len(paragraph) <= max_size:
        return [paragraph]

    chunks = []
    words = paragraph.split(" ")
    current_chunk = ""

    for word in words:
        # If adding this word would exceed the limit
        if len(current_chunk) + len(word) + 1 > max_size:
            # Add current chunk to results
            if current_chunk:
                chunks.append(current_chunk)
            # Start a new chunk
            current_chunk = word
        else:
            # Add word to current chunk
            if current_chunk:
                current_chunk += " " + word
            else:
                current_chunk = word

    # Add final chunk if it exists
    if current_chunk:
        chunks.append(current_chunk)

    return chunks


# 2. List Documents (GET)
@Document_bp.route("/listDocuments/", methods=["GET"])
@jwt_required()
def listeDocuments():
    current_user = get_jwt_identity()
    print(f"Utilisateur actuel : {current_user}")

    documents = Document.query.all()
    results = [
        {
            "titre": document.titre,
            "date_ajout": document.date_ajout,
            "id": document.DocumentId,
            "file_path": document.file_path,
            "auteur": document.auteur,
            "etablissement": document.user.etablissement if document.user else None,
            "status": document.user.status if document.user else None,
        }
        for document in documents
    ]
    return jsonify(results), 200


# 3. View Document by ID (GET)
@Document_bp.route("/document/<int:DocumentId>", methods=["GET"])
@jwt_required()
def VoirDocument(DocumentId):
    document = Document.query.get_or_404(DocumentId)
    return (
        jsonify(
            {
                "titre": document.titre,
                "date_ajout": document.date_ajout,
                "file_path": document.file_path,
                "auteur": document.auteur,
                "etablissement": document.user.etablissement if document.user else None,
                "status": document.user.status if document.user else None,
            }
        ),
        200,
    )


# 4. Update Document (PUT)
@Document_bp.route("/document/<int:DocumentId>", methods=["PUT"])
@jwt_required()
def Modifier(DocumentId):
    document = Document.query.get_or_404(DocumentId)

    document.titre = request.form.get("titre")
    document.auteur = request.form.get("auteur")
    db.session.commit()
    return jsonify({"message": f"Le document '{document.DocumentId}' a été modifié!"})


# 5. Delete Document (DELETE)
@Document_bp.route("/SupprimerDoc/<int:DocumentId>", methods=["DELETE"])
@jwt_required()
def Supprimer(DocumentId):
    print(DocumentId)
    document = Document.query.get_or_404(DocumentId)
    para = Paragraph.query.filter_by(documentId=document.DocumentId).all()

    # Use batch deletion for paragraphs to improve performance
    try:
        for p in para:
            db.session.delete(p)
        db.session.delete(document)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error deleting document: {str(e)}"}), 500

    return (
        jsonify({"message": f"Le document '{document.DocumentId}' a été supprimé!"}),
        200,
    )


# Improved utility function to read the document by paragraphs
def read_file_by_paragraphs(file_path):
    print("Reading file:", file_path)
    ext = os.path.splitext(file_path)[1].lower()
    paragraphs = []

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            content = file.read()
            # Split by double newlines (paragraph breaks)
            raw_paragraphs = content.split("\n\n")

            # Process each paragraph
            for para in raw_paragraphs:
                if not para.strip():
                    continue

                # Handle single line breaks that might be within a paragraph
                lines = para.split("\n")
                if len(lines) > 1:
                    # Join lines that appear to be part of the same paragraph
                    current_para = ""
                    for line in lines:
                        if line.strip():  # If line is not empty
                            if current_para:
                                current_para += " " + line.strip()
                            else:
                                current_para = line.strip()
                        else:  # Empty line indicates paragraph break
                            if current_para:
                                paragraphs.append(current_para)
                                current_para = ""
                    if current_para:  # Add the last paragraph
                        paragraphs.append(current_para)
                else:
                    # Single line paragraph
                    if para.strip():
                        paragraphs.append(para.strip())

    elif ext == ".docx":
        doc = DocxDocument(file_path)
        current_paragraph = ""

        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                # Empty paragraph might indicate a break
                if current_paragraph:
                    paragraphs.append(current_paragraph)
                    current_paragraph = ""
                continue

            # Check for heading style which indicates a title
            if para.style.name.startswith("Heading"):
                # We don't add headings as paragraphs, they are titles
                continue

            # Regular paragraph text - accumulate
            if current_paragraph:
                current_paragraph += " " + text
            else:
                current_paragraph = text

        # Add the last paragraph if there's any text left
        if current_paragraph:
            paragraphs.append(current_paragraph)

    elif ext == ".pdf":
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            current_paragraph = ""

            # Process each page
            for page in reader.pages:
                page_text = page.extract_text()
                if not page_text:
                    continue

                # Split the page text into lines
                lines = page_text.split("\n")
                for line in lines:
                    line = line.strip()
                    if not line:
                        # Empty line might indicate paragraph break
                        if current_paragraph:
                            paragraphs.append(current_paragraph)
                            current_paragraph = ""
                        continue

                    # Check if this line looks like a title/heading
                    if is_likely_title(line):
                        # Store any accumulated paragraph
                        if current_paragraph:
                            paragraphs.append(current_paragraph)
                            current_paragraph = ""
                        # Skip the title
                        continue

                    # Add line to current paragraph
                    if current_paragraph:
                        # Check if this line continues the previous sentence
                        if current_paragraph[-1] not in ".!?\"'" or line[0].islower():
                            current_paragraph += " " + line
                        else:
                            # New sentence in a new line - might be new paragraph
                            paragraphs.append(current_paragraph)
                            current_paragraph = line
                    else:
                        current_paragraph = line

            # Add final paragraph if any
            if current_paragraph:
                paragraphs.append(current_paragraph)
    else:
        raise ValueError(f"Format de fichier non pris en charge : {ext}")

    # Final cleaning and merging of paragraphs that appear to be split incorrectly
    cleaned_paragraphs = []
    current_para = ""

    for para in paragraphs:
        clean_para = para.strip()
        if not clean_para:
            continue

        # Check if this might be continuation of previous paragraph
        if (
            current_para
            and not current_para.endswith((".", "!", "?", ":", ";"))
            and len(clean_para) < 200
        ):
            current_para += " " + clean_para
        else:
            # Start a new paragraph
            if current_para:
                cleaned_paragraphs.append(current_para)
            current_para = clean_para

    # Add final paragraph
    if current_para:
        cleaned_paragraphs.append(current_para)

    return cleaned_paragraphs


@Document_bp.route("/documents/uncategorized/", methods=["GET"])
@jwt_required()
def documents_non_categorises():
    # Cherche tous les documents qui ont AU MOINS un paragraphe sans categorie_id
    documents = (
        db.session.query(Document)
        .join(Paragraph, Document.DocumentId == Paragraph.documentId)
        .filter(Paragraph.categorie_id == None)
        .distinct()
        .all()
    )

    result = [{"id": doc.DocumentId, "titre": doc.titre} for doc in documents]
    return jsonify(result), 200


@Document_bp.route("/search_advanced/", methods=["POST"])
@jwt_required()
def advanced_search():
    data = request.json
    global_search = data.get("globalSearch", "")
    title_search = data.get("titleSearch", "")
    author_search = data.get("authorSearch", "")
    content_search = data.get("contentSearch", "")
    selected_categories = data.get("selectedCategories", [])
    date_range = data.get("dateRange", {})
    start_str = date_range.get("startDate", "").strip()
    end_str = date_range.get("endDate", "").strip()
    query = Document.query

    # Global search across Document and related Paragraphe content
    if global_search:
        # Use a subquery approach to avoid index limitations
        if (
            len(global_search) > 100
        ):  # Long search queries could also trigger index issues
            global_search = global_search[:100]  # Truncate long search terms

        query = query.filter(
            db.or_(
                Document.titre.ilike(f"%{global_search}%"),
                Document.auteur.ilike(f"%{global_search}%"),
                Document.file_path.ilike(f"%{global_search}%"),
                Document.DocumentId.in_(
                    db.session.query(Paragraph.documentId)
                    .filter(
                        func.lower(Paragraph.contenu).contains(global_search.lower())
                    )
                    .subquery()
                ),
            )
        )

    # Search by title
    if title_search:
        query = query.filter(Document.titre.ilike(f"%{title_search}%"))
    if author_search:
        query = query.filter(Document.auteur.ilike(f"%{author_search}%"))

    # Search by content in paragraphs - modified to avoid index issues
    if content_search:
        # Use subquery approach
        content_docs = (
            db.session.query(Paragraph.documentId)
            .filter(func.lower(Paragraph.contenu).contains(content_search.lower()))
            .distinct()
            .subquery()
        )
        query = query.filter(Document.DocumentId.in_(content_docs))

    # Filter by selected categories - using a more efficient approach
    if selected_categories:
        category_docs = (
            db.session.query(Paragraph.documentId)
            .filter(Paragraph.categorie_id.in_(selected_categories))
            .distinct()
            .subquery()
        )
        query = query.filter(Document.DocumentId.in_(category_docs))

    # Vérifier si les valeurs ne sont pas des chaînes vides
    if start_str.strip() and end_str.strip():
        from datetime import datetime

        try:
            start_date = datetime.strptime(start_str, "%Y-%m-%d")
            end_date = datetime.strptime(end_str, "%Y-%m-%d")
            query = query.filter(Document.date_ajout.between(start_date, end_date))
        except ValueError:
            return (
                jsonify(
                    {
                        "error": "Format de date invalide. Utilisez le format 'YYYY-MM-DD'."
                    }
                ),
                400,
            )

    # Execute the query
    try:
        results = query.all()
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la recherche: {str(e)}"}), 500

    # Convert results to JSON format with improved approach to avoid memory issues
    results_json = []
    for doc in results:
        # Fetch paragraphs separately for each document to avoid large joins
        try:
            paras = Paragraph.query.filter_by(documentId=doc.DocumentId).all()
            para_list = [
                {
                    "ParagrapheId": para.ParagrapheId,
                    "contenu": para.contenu[:500]
                    + (
                        "..." if len(para.contenu) > 500 else ""
                    ),  # Truncate long content for response
                    "categorie_id": para.categorie_id,
                }
                for para in paras
            ]
        except Exception as e:
            para_list = [{"error": f"Could not load paragraphs: {str(e)}"}]

        doc_json = {
            "DocumentId": doc.DocumentId,
            "titre": doc.titre,
            "date_ajout": doc.date_ajout.strftime("%Y-%m-%d"),
            "user_id": doc.user_id,
            "auteur": doc.auteur,
            "paragraphs_count": len(para_list),
            "paragraphes": para_list,
        }
        results_json.append(doc_json)

    return jsonify(results_json)


@Document_bp.route("/Document/search", methods=["GET"])
@jwt_required()
def search_document():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "No search query provided"}), 400

    # Assuming you have a 'label' field to search in
    documents = Document.query.filter(Document.titre.ilike(f"%{query}%")).all()

    # Convert results to JSON
    result = [
        {
            "id": doc.DocumentId,
            "titre": doc.titre,
            "date_ajout": doc.date_ajout,
            "auteur": doc.auteur,
        }
        for doc in documents
    ]

    return jsonify(result), 200


# Improved file viewing endpoint to display files in browser
@Document_bp.route("/documents/uploads/<filename>", methods=["GET"])
def view_file(filename):
    upload_folder = os.path.join(os.path.dirname(__file__), "uploads")
    file_path = os.path.join(upload_folder, filename)

    if not os.path.exists(file_path):
        return {"message": "Fichier introuvable"}, 404

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        # Set proper headers for PDF display in browser
        try:
            response = send_file(
                file_path,
                mimetype="application/pdf",
                as_attachment=False,
                download_name=filename,
            )
            # This is crucial for browser display instead of download
            response.headers["Content-Disposition"] = f"inline; filename={filename}"
            return response
        except Exception as e:
            return jsonify({"error": f"Error sending PDF file: {str(e)}"}), 500

    elif ext == ".docx":
        # Enhanced DOCX display with better formatting
        try:
            doc = DocxDocument(file_path)

            # Generate a more complete HTML with basic styling
            html_content = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Document Viewer</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1 { color: #333; }
                    h2 { color: #444; }
                    p { margin-bottom: 16px; }
                    .content { max-width: 800px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="content">
            """

            for para in doc.paragraphs:
                text = para.text.strip()
                if not text:
                    html_content += "<br>"
                    continue

                # Check if paragraph is a heading based on its style
                if para.style.name.startswith("Heading 1"):
                    html_content += f"<h1>{text}</h1>"
                elif para.style.name.startswith("Heading 2"):
                    html_content += f"<h2>{text}</h2>"
                elif para.style.name.startswith("Heading"):
                    html_content += f"<h3>{text}</h3>"
                else:
                    html_content += f"<p>{text}</p>"

            html_content += """
                </div>
            </body>
            </html>
            """

            # Return HTML content with appropriate MIME type
            response = Response(html_content, mimetype="text/html")
            return response

        except Exception as e:
            return jsonify({"error": f"Error processing DOCX: {str(e)}"}), 500

    elif ext == ".txt":
        # Display text files with proper formatting
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            # Simple HTML formatting for text files
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>{filename}</title>
                <style>
                    body {{ font-family: monospace; white-space: pre-wrap; margin: 20px; }}
                </style>
            </head>
            <body>
                {content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')}
            </body>
            </html>
            """

            return Response(html_content, mimetype="text/html")

        except Exception as e:
            return jsonify({"error": f"Error reading text file: {str(e)}"}), 500
    else:
        return {"message": "Format de fichier non pris en charge"}, 400
