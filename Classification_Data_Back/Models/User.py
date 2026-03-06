from werkzeug.security import generate_password_hash, check_password_hash
from config import db

class User(db.Model):

    Userid = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(30), nullable=False)
    motdepasse = db.Column(db.String(255), nullable=False)  # Increased length for hashed passwords
    email = db.Column(db.String(50), nullable=False)
    etablissement = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    documents = db.relationship('Document', backref='user', lazy=True)
    categories = db.relationship('Categorie', backref='user', lazy=True)
    def __init__(self, nom, motdepasse, email, etablissement, status):
        self.nom = nom
        self.motdepasse = generate_password_hash(motdepasse)  # Hash the password
        self.email = email
        self.etablissement = etablissement
        self.status = status

    def check_password(self, password):
        return check_password_hash(self.motdepasse, password)
