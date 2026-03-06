from config import db
from flask import Blueprint, request, jsonify
from Models.Categorie import Categorie
from flask_jwt_extended import  jwt_required ,  get_jwt_identity
    