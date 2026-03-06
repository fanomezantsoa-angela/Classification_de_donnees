from config import db
import datetime
class Document(db.Model):
    DocumentId=db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(255), nullable=False, index=True)
    date_ajout = db.Column(db.Date, nullable=False, index=True)
    auteur = db.Column(db.String(255), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.Userid'), nullable=False)
    file_path = db.Column(db.String(255))
    paragraphes = db.relationship('Paragraph', backref='document', lazy=True)
    def __init__(self, titre, user_id, file_path, auteur):
        self.titre = titre
        self.date_ajout= datetime.date.today()
        self.user_id = user_id
        self.file_path = file_path
        self.auteur = auteur
