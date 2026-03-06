from flask import Blueprint, request, jsonify
import os
from collections import Counter
import string
import re
from config import db
from Models.Categorie import Categorie
from flask_jwt_extended import  jwt_required ,  get_jwt_identity
Categorie_bp=Blueprint('categorie', __name__)
@Categorie_bp.route('/addCategorie/', methods=['POST'])
@jwt_required() 
def Ajouter():
    current_user = get_jwt_identity()
    data=request.json
    motCle=data.get('motCle')
    description=data.get('description')
    new_cat= Categorie(motCle=motCle, description=description, user_id=current_user)
    db.session.add(new_cat)
    db.session.commit()
    return jsonify({"message": f"nouveau categorie ajouté avec id {new_cat.CategorieId}"})

@Categorie_bp.route('/listCategories/', methods=['GET'])
@jwt_required() 
def listeDocuments():
    categories= Categorie.query.all()
   
    results=[{"mot clé": categorie.motCle, "description": categorie.description}  for categorie in categories]
    return jsonify(results)
@Categorie_bp.route('/categorie/<int:DocumentId>', methods=['GET'])
@jwt_required() 
def VoirDocument(CategorieId):
    categorie= Categorie.query.get_or_404CategorieId(CategorieId)
    return jsonify({"mot clé": categorie.motCle, "description": categorie.description})

# 3. Update (PUT)
@Categorie_bp.route('/categorie/<int:DocumentId>', methods=['PUT'])
@jwt_required() 
def Modifier(CategorieId):
    document = Categorie.query.get_or_404(CategorieId)
    data = request.json
    document.titre = data['titre']
  
    db.session.commit()
    return jsonify({"message": f"le categorie '{document.CategorieId}' est modifié!"})

# 4. Delete (DELETE)
@Categorie_bp.route('/SupprimerCategorie/<int:CategorieId>', methods=['DELETE'])
@jwt_required() 
def Supprimer(CategorieId):
    document = Categorie.query.get_or_404(CategorieId)
    db.session.delete(document)
    db.session.commit()
    return jsonify({"message": f"le categorie '{document.CategorieId}' est supprimé!"})
@Categorie_bp.route('/Classification/', methods=['POST'])
def Classification():
   print('bonjour')
   results= read_file_by_paragraphs("docum.txt")
   for i, paragraph in enumerate(results, start=1):
      print(f"Paragraph {i}:\n{paragraph}\n")
      classificationParCategorie(paragraph)
   return jsonify({"message": "lire document"})

def read_file_by_paragraphs(filename):
    file_path = os.path.join(os.path.dirname(__file__), filename)
  
    with open(file_path, 'r', encoding='utf-8') as file:
       content = file.read()
       paragraphs = content.split('.\n')

       # Remove any leading/trailing whitespace from each paragraph
       paragraphs = [para.strip() for para in paragraphs if para.strip()]

    return paragraphs

def classificationParCategorie(texte):
    categories=Categorie.query.all()
    for categorie in categories:
        catmotcle=categorie.motCle
        tableauMotCle= motcleEnchaine(catmotcle)
        print(tableauMotCle)
        totalcompte=0
        for mot in tableauMotCle:
            
            count=texte.count(mot)
            if count >= 1:
                print(count)
                print(mot + " present")
            else:
                print("absent")
               

            totalcompte+=count
        if(totalcompte >= 5 ):
            print(f"'{categorie.description}' est le categorie de ce texte")
        else:
            print("categorie absent")
            motCleTrouvé=chercherMotCle(texte)
            print(f"mot clé trouvé {motCleTrouvé}")
            
def motcleEnchaine(chaine):
    return chaine.split(',')

def calcul_Frequence_mot(paragraph):
     paragraph = paragraph.translate(str.maketrans('', '', string.punctuation)).lower()

    # Split the paragraph into words
     words = paragraph.split()

    # Calculate the frequency of each word
     word_count = Counter(words)
    
     return word_count

def chercherMotCle(paragraph, min_count = 3):
    word_count = calcul_Frequence_mot(paragraph)

    # Find words that occur more than 'min_count' times
    keywords = [word for word, count in word_count.items() if count >= min_count]
    
    return keywords