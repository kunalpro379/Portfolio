from pymongo import MongoClient, ASCENDING
from datetime import datetime

MONGO_URI = "mongodb+srv://kunal:kunal@cluster0.d00uuq3.mongodb.net/mydb?retryWrites=true&w=majority"   # change if using Atlas
DB_NAME = "Portfolio"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

collections = {
    "blogs": {
        "indexes": ["slug", "created_at"]
    },
    "documentation": {
        "indexes": ["slug", "created_at"]
    },
    "projects": {
        "indexes": ["slug", "created_at"]
    },
    "notes": {
        "indexes": ["created_at"]
    },
    "portfolio": {
        "indexes": ["created_at"]
    }
}

def create_collections():
    existing = db.list_collection_names()

    for name, config in collections.items():
        if name not in existing:
            collection = db[name]
            print(f"Created collection: {name}")

            # Create indexes
            for field in config["indexes"]:
                collection.create_index([(field, ASCENDING)])
                print(f"Index created on '{field}'")

            # Insert sample document (optional but useful)
            collection.insert_one({
                "title": f"Sample {name.capitalize()}",
                "slug": f"sample-{name}",
                "content": "Initial document",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            })

        else:
            print(f"Collection already exists: {name}")

if __name__ == "__main__":
    create_collections()
    print("\nMongoDB setup completed successfully")
