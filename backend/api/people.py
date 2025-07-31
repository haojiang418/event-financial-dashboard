# /backend/api/people.py

from flask import Blueprint, request, jsonify
from database import db

people_bp = Blueprint('people_api', __name__)

@people_bp.route('/<categoryType>/<subCategoryName>/people', methods=['GET'])
def get_people(categoryType, subCategoryName):
    """
    Fetches all people for a subcategory.
    """
    try:
        people_docs = list(db.people.find({
            "categoryType": categoryType,
            "subCategoryName": subCategoryName
        }, {'_id': 0, 'name': 1}))
        people_list = [p['name'] for p in people_docs]
        return jsonify(people_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@people_bp.route('/<categoryType>/<subCategoryName>/people', methods=['POST'])
def add_person(categoryType, subCategoryName):
    """
    Adds a person to a subcategory.
    """
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({"error": "Missing name"}), 400
    
        person_to_add = {
            "categoryType": categoryType,
            "subCategoryName": subCategoryName,
            "name": data['name']
        }

        db.people.update_one(
            {"categoryType": categoryType, "subCategoryName": subCategoryName, "name": data['name']},
            {"$setOnInsert": person_to_add},
            upsert=True
        )
    
        updated_people = get_people(categoryType, subCategoryName)
        return updated_people
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@people_bp.route('/<categoryType>/<subCategoryName>/people/<personName>', methods=['DELETE'])
def delete_person(categoryType, subCategoryName, personName):
    """
    Deletes a person from a subcategory.
    """
    try:
        db.people.delete_one({
            "categoryType": categoryType,
            "subCategoryName": subCategoryName,
            "name": personName
        })

        updated_people = get_people(categoryType, subCategoryName)
        return updated_people
    except Exception as e:
        return jsonify({"error": str(e)}), 500