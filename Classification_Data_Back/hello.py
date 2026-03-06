from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from config import db  
from flask_jwt_extended import JWTManager
# Import and register the blueprint
from Routes.UserBP import user_bp
from Routes.DocumentBP import Document_bp
from Routes.CategorieBP import Categorie_bp
from Routes.ParagraphBP import Paragraphe_bp
from flask_jwt_extended.exceptions import (
    NoAuthorizationError,
 
    JWTDecodeError,
)


# Create the Flask app
app = Flask(__name__)
jwt = JWTManager(app)
# CORS setup
CORS(app, supports_credentials=True)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"
# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@db:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "q9T6!aG$7pZ@wL1kX#vE2nF%rJ3bM8dH"
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB for example
# Initialize the database
db.init_app(app)
migrate = Migrate(app, db)
@app.errorhandler(NoAuthorizationError)
def handle_no_authorization_error(e):
    return {"message": "Aucun token JWT fourni ou invalide"}, 401


@app.errorhandler(JWTDecodeError)
def handle_jwt_decode_error(e):
    return {"message": "Erreur de décodage du JWT"}, 401


app.register_blueprint(user_bp)
app.register_blueprint(Document_bp)
app.register_blueprint(Categorie_bp)
app.register_blueprint(Paragraphe_bp)
# Create tables
# This will create all tables based on the models
with app.app_context():
    db.create_all()
# Run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
