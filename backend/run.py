# /backend/run.py

from app import create_app
from database import db

def default_database():
    if db.categories.count_documents({}) == 0:
        print("Filling in database...")
        categories_to_fill = [
            {"name": "Events"},
            {"name": "Retreats"},
            {"name": "Recreation"},
            {"name": "Other"}
        ]
        db.categories.insert_many(categories_to_fill)
        print("Databases filled.")
    else:
        print("Databases already exist.")

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        default_database()
    app.run(debug=True)