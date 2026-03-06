from flask import Blueprint, request, jsonify
from config import db
from Models.User import User
from flask_jwt_extended import create_access_token, jwt_required ,  create_refresh_token, get_jwt_identity, get_jwt
from werkzeug.security import  check_password_hash
blacklist = set()
user_bp = Blueprint('user', __name__)
@user_bp.route('/createUser/', methods=['POST'])
def createUser():
    data=request.json
    nom=data.get('nom')
    motdepasse= data.get('motdepasse')
    email=data.get('email')
    etablissement=data.get('etablissement')
    status=data.get('status')
    new_user = User(nom=nom, motdepasse=motdepasse, email=email, etablissement=etablissement, status=status)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "utilisateur a été crée"}), 200

@user_bp.route('/login/', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    motdepasse = data['motdepasse']
   

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.motdepasse, motdepasse):
        access_token = create_access_token(identity=str(user.Userid))
        refresh_token = create_refresh_token(identity=user.Userid)
        return jsonify({'message': 'Login Success', 'access_token': access_token, 'refresh_token': refresh_token})
    else:
        return jsonify({'message': 'Login Failed'}), 401

@user_bp.route('/refresh/', methods=['POST'])
@jwt_required(refresh=True)  # Ensure that only refresh tokens are allowed
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    refresh_token = create_refresh_token(identity=current_user.Userid)
    return jsonify({'access_token': new_access_token, 'refresh_token': refresh_token})

@user_bp.route('/logout/', methods=['POST'])
@jwt_required()  # Protect the route with access token
def logout():
    jti = get_jwt()["jti"]  # Get the unique identifier of the JWT
    blacklist.add(jti)  # Add token to the blacklist
    return jsonify({"msg": "Successfully logged out"}), 200