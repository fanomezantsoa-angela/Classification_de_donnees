from config import db
from sqlalchemy import Text

class Categorie(db.Model):
    CategorieId=db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(255), nullable=False, index=True)
    description = db.Column(Text, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.Userid'), nullable=False)
    def __init__(self, label, description, user_id):
        self.label = label
        self.description=description
        self.user_id = user_id
