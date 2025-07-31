# /backend/database.py

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# DATA MODELS
# categories: { name: string }
# subcategories: { categoryType: string, name: string, date: string, budget: number }
# items: { categoryType: string, subCategoryName: string, itemName: string, quantity: number, costPerUnit: number, totalCost: number, people: string[], date: string }
# people: { categoryType: string, subCategoryName: string, name: string }

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client.financial_tracker