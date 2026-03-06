from Models.Paragraph import Paragraph
from flask import Blueprint, request, jsonify
from config import db
from sqlalchemy import text

Paragraphe_bp = Blueprint("paragraph", __name__)


@Paragraphe_bp.route("/Paragraphs/", methods=["GET"])
def fetch_paragraphs():
    try:
        # ORM - on récupère tous les paragraphes
        paragraphs = Paragraph.query.all()

        # On formate le résultat
        paragraph_list = [
            {
                "ParagrapheId": para.ParagrapheId,
                "contenu": para.contenu,
                "document_id": para.documentId,
                "categorie_id": para.categorie_id,
            }
            for para in paragraphs
        ]

        return (
            jsonify(
                {
                    "err": False,
                    "message": "Paragraphes récupérés avec succès",
                    "data": paragraph_list,
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "err": True,
                    "message": f"Erreur lors de la récupération des paragraphes : {str(e)}",
                }
            ),
            500,
        )


@Paragraphe_bp.route("/paragraphs/by_category/<int:categorie_id>", methods=["GET"])
def get_paragraphs_by_category(categorie_id):
    paragraphs = (
        db.session.query(Paragraph).filter(Paragraph.categorie_id == categorie_id).all()
    )

    result = [
        {"id": p.id, "contenu": p.contenu, "documentId": p.documentId}
        for p in paragraphs
    ]
    if result == []:
        return jsonify({"message": "Aucun paragraphe trouvé pour cette catégorie"})
    else:
        return jsonify(result), 200
  
 
