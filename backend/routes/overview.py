# backend/routes/overview.py

from flask import Blueprint, jsonify
from bson.son import SON
from app import db

overview_bp = Blueprint("overview_bp", __name__)

@overview_bp.route("/monthly-expenses", methods=["GET"])
def monthly_expenses():
    """
    GET /api/overview/monthly-expenses
    Returns: [
      { "year": 2025, "month": 1, "total": 3400 },
      { "year": 2025, "month": 2, "total": 2850 },
      ...
    ]
    (Grouped by year & month, summing totalCost)
    """
    pipeline = [
        {
            "$group": {
                "_id": {
                    "year":  {"$year": {"$dateFromString": {"dateString": "$date"}}},
                    "month": {"$month":{"$dateFromString": {"dateString": "$date"}}}
                },
                "total": {"$sum": "$totalCost"}
            }
        },
        {
            "$sort": SON([("_id.year", 1), ("_id.month", 1)])
        }
    ]
    agg = db.items.aggregate(pipeline)
    result = []
    for doc in agg:
        year = doc["_id"]["year"]
        month = doc["_id"]["month"]
        total = doc["total"]
        result.append({"year": year, "month": month, "total": total})
    return jsonify(result), 200


@overview_bp.route("/category-breakdown", methods=["GET"])
def category_breakdown():
    """
    GET /api/overview/category-breakdown
    Returns: [
      { "category": "Retreats",  "total": 7200 },
      { "category": "Kickbacks", "total": 4100 },
      ...
    ]
    (Grouped by category, summing totalCost)
    """
    pipeline = [
        {
            "$group": {
                "_id": "$category",
                "total": {"$sum": "$totalCost"}
            }
        }
    ]
    agg = db.items.aggregate(pipeline)
    result = []
    for doc in agg:
        result.append({"category": doc["_id"], "total": doc["total"]})
    return jsonify(result), 200
