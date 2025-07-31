# /backend/api/items.py

from  flask import Blueprint, request, jsonify
from database import db
from bson import ObjectId

items_bp = Blueprint('items_api', __name__)

@items_bp.route('/<categoryType>/<subCategoryName>/items', methods=['GET'])
def get_items(categoryType, subCategoryName):
    """
    Fetches all expense items for a subcategory.
    """
    try:
        items = list(db.items.find({
            "categoryType": categoryType,
            "subCategoryName": subCategoryName
        }))

        for item in items:
            item['_id'] = str(item['_id'])
        return jsonify(items), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@items_bp.route('/<categoryType>/<subCategoryName>/items', methods=['POST'])
def add_item(categoryType, subCategoryName):
    """
    Creates a new expense item.
    """
    try:
        data = request.get_json()
        if not all(k in data for k in ['itemName', 'quantity', 'costPerUnit', 'date']):
            return jsonify({"error": "Missing required fields"}), 400
    
        total_cost = data['quantity'] * data['costPerUnit']
        new_item = {
            "categoryType": categoryType,
            "subCategoryName": subCategoryName,
            "itemName": data["itemName"],
            "quantity": data["quantity"],
            "costPerUnit": data["costPerUnit"],
            "totalCost": total_cost,
            "people": data.get("people", []),
            "date": data["date"]
        }
        result = db.items.insert_one(new_item)

        new_item['_id'] = str(result.inserted_id)
        return jsonify(new_item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@items_bp.route('/<categoryType>/<subCategoryName>/items/<itemId>', methods=['DELETE'])
def delete_item(categoryType, subCategoryName, itemId):
    """
    Deletes an expense item.
    """
    try:
        result = db.items.delete_one({"_id": ObjectId(itemId)})
        if result.deleted_count == 1:
            return jsonify({"message": "Item deleted successfully"}), 200
        else:
            return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
