from flask import Blueprint, request, jsonify
import os
from collections import Counter
import string
import re
from dotenv import load_dotenv
import openai
from config import db
from Models.Categorie import Categorie
from Models.Paragraph import Paragraph
from Models.Document import Document
from flask_jwt_extended import  jwt_required ,  get_jwt_identity
load_dotenv()

# Configurer OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")


Categorie_bp=Blueprint('categorie', __name__)
@Categorie_bp.route("/addCategorie/", methods=["POST"])
@jwt_required()
def Ajouter():
    current_user = get_jwt_identity()
    data=request.json
    label=data.get('label')
    description=data.get('description')
    new_cat= Categorie(label=label, description=description, user_id=current_user)
    db.session.add(new_cat)
    db.session.commit()
    return jsonify({"message": f"nouveau categorie ajouté avec id {new_cat.CategorieId}"}),  200


@Categorie_bp.route("/listCategories/", methods=["GET"])
@jwt_required()

def listeDocuments():
    categories= Categorie.query.all()
   
    results=[{"id": categorie.CategorieId, "label": categorie.label, "description": categorie.description}  for categorie in categories]
    return jsonify(results)
@Categorie_bp.route("/categorie/<int:DocumentId>", methods=["GET"])
@jwt_required()
def VoirCategory(CategorieId):
    categorie= Categorie.query.get_or_404CategorieId(CategorieId)
    return jsonify({"label": categorie.label, "description": categorie.description})


# 3. Update (PUT)
@Categorie_bp.route("/categorie/<int:DocumentId>", methods=["PUT"])
@jwt_required()
def Modifier(CategorieId):
    document = Categorie.query.get_or_404(CategorieId)
    data = request.json
    document.label = data['label']
    document.description = data["description"]
    db.session.commit()
    return jsonify({"message": f"le categorie '{document.CategorieId}' est modifié!"})


# 4. Delete (DELETE)
@Categorie_bp.route("/SupprimerCategorie/<int:CategorieId>", methods=["DELETE"])
@jwt_required()
def Supprimer(CategorieId):
    document = Categorie.query.get_or_404(CategorieId)
    db.session.delete(document)
    db.session.commit()
    return jsonify({"message": f"le categorie '{document.CategorieId}' est supprimé!"})


@Categorie_bp.route("/Classification/<int:documentId>", methods=["POST"])
@jwt_required()
def Classification(documentId):
    
    results = Paragraph.query.filter_by(documentId=documentId).all()
    document = Document.query.get_or_404(documentId)

    # Variable pour suivre le statut général
    classification_success = True

    for i, paragraph in enumerate(results, start=1):
        print(f"Paragraph {i}:\n{paragraph.contenu}\n")
        reponse = classificationAvecPrompt(paragraph)

        if not reponse:
            print(f"Erreur : Échec de classification pour le paragraphe {i}.")
            classification_success = False  # Marquer l'erreur mais continuer

    # Historique seulement si tous les paragraphes ont été classifiés
    if classification_success:
        
           
     
        return jsonify({"message": "Document entièrement classifié"}), 200
    else:
        return jsonify({"message": "Certaines classifications ont échoué"}), 500


@Categorie_bp.route("/Categorie/search", methods=["GET"])
@jwt_required()
def search_categorie():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "No search query provided"}), 400

    # Assuming you have a 'label' field to search in
    categories = Categorie.query.filter(Categorie.label.ilike(f"%{query}%")).all()

    # Convert results to JSON
    result = [
        {"id": cat.CategorieId, "label": cat.label, "description": cat.description}
        for cat in categories
    ]

    return jsonify(result), 200


@Categorie_bp.route("/Categorie/statistique", methods=["GET"])
@jwt_required()
def statistique_categorie():
    results = (
        db.session.query(
            Categorie.label, db.func.count(Paragraph.ParagrapheId).label("nbdocuments")
        )
        .join(Paragraph, Paragraph.categorie_id == Categorie.CategorieId)
        .group_by(Categorie.label)
        .all()
    )

    stats = [
        {"label": label, "nbdocuments": nbdocuments} for label, nbdocuments in results
    ]

    return jsonify(stats), 200


def classificationAvecPrompt(new_para):
    # Récupérer toutes les catégories de la base
    categories = Categorie.query.all()

    descriptions = [category.description for category in categories]
    labels = [category.label for category in categories]

    # Dictionnaire : label ➔ ID de la catégorie
    label_to_id = {category.label: category.CategorieId for category in categories}

    # Construction du prompt
    prompt = (
        f"Voici une liste de catégories et leurs descriptions :\n"
        + "".join(
            f"- (Label : {category.label}) {category.description}\n"
            for category in categories
        )
        + f"""

Je vais te donner un paragraphe. Donne-moi uniquement le libellé (**Label**) de la catégorie qui correspond le mieux à ce paragraphe, basé sur la description.

Paragraphe : "{new_para.contenu}"

Réponds uniquement avec le libellé correspondant, sans autre explication.
"""
    )

    try:
        # Appel à OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )

        # Récupérer la réponse du modèle
        predicted_label = response.choices[0].message.content.strip()

        # Associer le label prédit à un ID de catégorie
        predicted_categorie_id = label_to_id.get(predicted_label)

        if predicted_categorie_id:
            print(f"Label prédit : {predicted_label}, ID : {predicted_categorie_id}")
            # Mettre à jour le paragraphe
            new_para.categorie_id = predicted_categorie_id
            db.session.commit()  # Sauvegarder dans la base
            return True
        else:
            print(f"Erreur : Aucun ID trouvé pour le label prédit '{predicted_label}'")
            return False

    except Exception as e:
        print(f"Erreur lors de l'appel à l'API OpenAI : {e}")
        return False
