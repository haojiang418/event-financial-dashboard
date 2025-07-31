# /backend/api/categories.py

from flask import Blueprint, request, jsonify
from database import db
from bson import ObjectId

categories_bp = Blueprint('categories_api', __name__)

@categories_bp.route('/', methods=['GET'])
def get_categories():
    """
    Fetches all main categories.
    """
    try:
        categories = list(db.categories.find({}, {'_id': 0}))
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@categories_bp.route('/<categoryType>/subcategories', methods=['GET'])
def get_subcategories(categoryType):
    """
    Fetches all subcategories for a given type, sorted by date.
    """
    try:
        subcategories = list(db.subcategories.find(
            {"categoryType": categoryType},
            {"_id": 0}
        ).sort("date", -1))
        return jsonify(subcategories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@categories_bp.route('/<categoryType>/subcategories', methods=['POST'])
def add_subcategory(categoryType):
    """
    Creates a new subcategory.
    """
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'date' not in data:
            return jsonify({"error": "Missing required fields: name, date"}), 400

        new_subcategory = {
            "categoryType": categoryType,
            "name": data["name"],
            "date": data["date"],
            "budget": data.get("budget", 0)
        }

        if db.subcategories.find_one({"categoryType": categoryType, "name": data["name"]}):
            return jsonify({"error": "Subcategory with this name already exists."}), 409
    
        db.subcategories.insert_one(new_subcategory)
        
        return jsonify({"message": "Subcategory created successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500