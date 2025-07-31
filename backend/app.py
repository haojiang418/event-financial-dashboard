# /backend/app.py

from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    from api.categories import categories_bp
    from api.items import items_bp
    from api.people import people_bp

    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(items_bp, url_prefix='/api/categories')
    app.register_blueprint(people_bp, url_prefix='/api/categories')

    return app