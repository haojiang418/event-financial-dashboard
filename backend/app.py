# backend/app.py

from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set in the .env file")

client = MongoClient(MONGO_URI)
db = client.get_default_database()  

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  

from routes.categories import categories_bp
from routes.overview import overview_bp

app.register_blueprint(categories_bp, url_prefix="/api/categories")
app.register_blueprint(overview_bp,    url_prefix="/api/overview")


if __name__ == "__main__":
    app.run(debug=True)
