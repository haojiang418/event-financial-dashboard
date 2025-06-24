# backend/routes/categories.py

from flask import Blueprint, request, jsonify
from app import db
from bson.objectid import ObjectId

categories_bp = Blueprint("categories_bp", __name__)

# COLLECTIONS:
# - db.categories  (stores: { name: <string> })
# - db.items       (stores: { category: <string>, itemName, quantity, costPerUnit, totalCost, people: [<strings>], date: <string> })
# - db.people      (stores: { category: <string>, name: <string> })


@categories_bp.route("/", methods=["GET"])
def list_categories():
    """
    GET /api/categories
    Returns: [
      { "_id": "<hex>", "name": "Retreats" },
      { "_id": "<hex>", "name": "Kickbacks" },
      ...
    ]
    """
    cursor = db.categories.find({}, {"name": 1})
    result = []
    for cat in cursor:
        if "name" in cat:
            result.append({"_id": str(cat["_id"]), "name": cat["name"]})
    return jsonify(result), 200


@categories_bp.route("/", methods=["POST"])
def add_category():
    """
    POST /api/categories
    Body: { "name": "Retreats" }
    Returns: { "_id": "<new_id>", "name": "Retreats" }
    """
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Category name is required"}), 400

    # Optionally avoid duplicates:
    existing = db.categories.find_one({"name": name})
    if existing:
        return jsonify({"error": "Category already exists"}), 400

    res = db.categories.insert_one({"name": name})
    return jsonify({"_id": str(res.inserted_id), "name": name}), 201


@categories_bp.route("/<categoryName>/items", methods=["GET"])
def get_items(categoryName):
    """
    GET /api/categories/<categoryName>/items
    Returns: [
      {
        "_id": "<hex>",
        "itemName": "Hotel booking",
        "quantity": 10,
        "costPerUnit": 150,
        "totalCost": 1500,
        "people": ["Alice", "Bob"],
        "date": "2025-06-10"
      },
      ...
    ]
    """
    cursor = db.items.find({"category": categoryName})
    items = []
    for it in cursor:
        items.append({
            "_id": str(it["_id"]),
            "itemName": it.get("itemName"),
            "quantity": it.get("quantity", 1),
            "costPerUnit": it.get("costPerUnit", 0),
            "totalCost": it.get("totalCost", 0),
            "people": it.get("people", []),
            "date": it.get("date")
        })
    return jsonify(items), 200


@categories_bp.route("/<categoryName>/items", methods=["POST"])
def add_item(categoryName):
    """
    POST /api/categories/<categoryName>/items
    Body: {
      "itemName": "Dinner catering",
      "quantity": 50,
      "costPerUnit": 20,
      "people": ["Alice","Bob"],   # optional
      "date": "2025-06-10"         # ISO date string
    }
    Returns the new item, including computed totalCost.
    """
    data = request.get_json()
    itemName   = data.get("itemName")
    quantity   = data.get("quantity", 1)
    costPerUnit= data.get("costPerUnit", 0)
    people     = data.get("people", [])
    date_str   = data.get("date") 

    if not itemName or quantity < 1 or costPerUnit < 0 or not date_str:
        return jsonify({"error": "Invalid input"}), 400

    totalCost = quantity * costPerUnit
    new_item = {
        "category": categoryName,
        "itemName": itemName,
        "quantity": quantity,
        "costPerUnit": costPerUnit,
        "totalCost": totalCost,
        "people": people,
        "date": date_str
    }
    res = db.items.insert_one(new_item)
    new_item["_id"] = str(res.inserted_id)
    return jsonify(new_item), 201


@categories_bp.route("/<categoryName>/people", methods=["GET"])
def get_people(categoryName):
    """
    GET /api/categories/<categoryName>/people
    Returns: ["Alice", "Bob", ...]
    """
    cursor = db.people.find({"category": categoryName})
    names = [p["name"] for p in cursor if "name" in p]
    return jsonify(names), 200


@categories_bp.route("/<categoryName>/people", methods=["POST"])
def add_person(categoryName):
    """
    POST /api/categories/<categoryName>/people
    Body: { "name": "David" }
    Returns updated list of names.
    """
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if db.people.find_one({"category": categoryName, "name": name}):
        return jsonify({"error": "Person already exists"}), 400

    db.people.insert_one({"category": categoryName, "name": name})
    cursor = db.people.find({"category": categoryName})
    updated = [p["name"] for p in cursor]
    return jsonify(updated), 201

@categories_bp.route("/api/categories/<categoryName>/people/<personName>", methods=["DELETE"])
def delete_person(categoryName, personName):
    result = db.people.delete_one({
        "category": categoryName,
        "name": personName})
    if result.modified_count == 0:
        return jsonify({"error": "Person not found"}), 404
    cursor = db.people.find({"category": categoryName})
    updated = [p["name"] for p in cursor]
    return jsonify(updated), 200
