from config import db
class Paragraph(db.Model):
    ParagrapheId=db.Column(db.Integer, primary_key=True)
    contenu = db.Column(db.Text, nullable=False, index=True)
    documentId = db.Column(db.Integer, db.ForeignKey('document.DocumentId'), nullable=False)

    categorie_id = db.Column(db.Integer, db.ForeignKey('categorie.CategorieId'), nullable=True)
    def __init__(self, contenu, documentId, categorie_id=None):
        self.contenu = contenu
        self.documentId = documentId
        self.categorie_id = categorie_id
