import json
import random
import string
from pymongo import MongoClient, ASCENDING
from datetime import datetime
from bson import ObjectId

MONGO_URI = "mongodb+srv://kunal:kunal@cluster0.d00uuq3.mongodb.net/mydb?retryWrites=true&w=majority"
DB_NAME = "Portfolio"

def generate_project_id():
    """Generate random 10 character ID (letters + digits)"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(10))

def insert_projects():
    """Insert projects from JSON file"""
    # Read JSON file
    try:
        with open('projects.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: projects.json file not found!")
        return
    except json.JSONDecodeError:
        print("Error: Invalid JSON in projects.json!")
        return
    
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Get the projects collection
    projects_collection = db['projects']
    
    # Delete the sample document if it exists
    projects_collection.delete_one({"title": "Sample Projects"})
    
    # Prepare documents for insertion
    projects_to_insert = []
    
    if "featuredProjects" in data:
        for project in data["featuredProjects"]:
            # Create slug from title
            slug = project["title"].lower().replace(" ", "-").replace(".", "-").replace("(", "").replace(")", "").replace("+", "-plus")
            
            # Create document with additional fields
            doc = {
                "_id": ObjectId(),
                "projectId": generate_project_id(),
                "title": project["title"],
                "slug": slug,
                "tagline": project["tagline"],
                "footer": project["footer"],
                "description": project["description"],
                "tags": project.get("tags", []),
                "links": project.get("links", []),
                "mdFiles": project.get("mdFiles", []),
                "assets": project.get("assets", []),  # Now empty array
                "cardasset": project.get("cardasset", []),  # New field for card images
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "featured": True
            }
            projects_to_insert.append(doc)
    
    # Insert into MongoDB
    if projects_to_insert:
        result = projects_collection.insert_many(projects_to_insert)
        print(f"Successfully inserted {len(result.inserted_ids)} projects into MongoDB")
        
        # Print sample project IDs
        print("\nSample project IDs created:")
        for i, doc in enumerate(projects_to_insert[:3]):
            card_asset = doc.get('cardasset', [])
            card_img = card_asset[0] if card_asset else "No image"
            print(f"{i+1}. {doc['title']}: {doc['projectId']} (Card: {card_img})")
    else:
        print("No projects found to insert")

def setup_database():
    """Setup collections and indexes"""
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
            "indexes": ["slug", "created_at", "projectId", "featured", "tags"]
        },
        "notes": {
            "indexes": ["created_at"]
        },
        "portfolio": {
            "indexes": ["created_at"]
        }
    }
    
    existing = db.list_collection_names()
    
    for name, config in collections.items():
        if name not in existing:
            collection = db[name]
            print(f"Created collection: {name}")
            
            # Only insert sample for non-projects collections
            if name != "projects":
                sample_doc = {
                    "title": f"Sample {name.capitalize()}",
                    "content": "Initial document",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
                
                if name in ["blogs", "documentation"]:
                    sample_doc["slug"] = f"sample-{name}"
                
                collection.insert_one(sample_doc)
                print(f"  Added sample document")
        else:
            print(f"Collection already exists: {name}")
        
        # Create indexes (for both new and existing collections)
        collection = db[name]
        for field in config["indexes"]:
            # Check if index exists
            existing_indexes = [idx['name'] for idx in collection.list_indexes()]
            index_name = f"{field}_1"
            
            if index_name not in existing_indexes:
                try:
                    collection.create_index([(field, ASCENDING)])
                    print(f"  Index created on '{field}'")
                except Exception as e:
                    print(f"  Error creating index on '{field}': {e}")

def verify_insertion():
    """Verify the inserted data"""
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    projects_collection = db['projects']
    
    print("\n" + "="*50)
    print("Verifying inserted data:")
    print("="*50)
    
    # Count documents
    total = projects_collection.count_documents({})
    print(f"Total projects in database: {total}")
    
    # Count with projectId (real projects)
    real_count = projects_collection.count_documents({"projectId": {"$exists": True}})
    print(f"Real projects (with projectId): {real_count}")
    
    # Show first 3 projects with cardasset
    print("\nFirst 3 projects (checking cardasset):")
    projects = projects_collection.find({"projectId": {"$exists": True}}).limit(3)
    for i, p in enumerate(projects, 1):
        print(f"\n{i}. {p['title']}")
        print(f"   ID: {p['projectId']}")
        print(f"   Assets: {len(p.get('assets', []))} items")
        print(f"   Cardassets: {len(p.get('cardasset', []))} items")
        if p.get('cardasset'):
            print(f"   First cardasset: {p['cardasset'][0]}")
        else:
            print(f"   No cardasset found")

def clean_sample_data():
    """Clean up any sample data from projects collection"""
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    projects_collection = db['projects']
    
    # Delete any documents without projectId (sample data)
    result = projects_collection.delete_many({"projectId": {"$exists": False}})
    if result.deleted_count > 0:
        print(f"\nCleaned up {result.deleted_count} sample documents without projectId")

def check_database_state():
    """Check current state of database"""
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    projects_collection = db['projects']
    
    print("\n" + "="*50)
    print("Current Database State:")
    print("="*50)
    
    # Get all projects
    all_projects = list(projects_collection.find({}, {"title": 1, "projectId": 1, "assets": 1, "cardasset": 1, "_id": 0}))
    
    print(f"Total documents: {len(all_projects)}")
    
    # Analyze assets vs cardasset
    print("\nField analysis:")
    projects_with_assets = sum(1 for p in all_projects if p.get('assets') and len(p.get('assets', [])) > 0)
    projects_with_cardasset = sum(1 for p in all_projects if p.get('cardasset') and len(p.get('cardasset', [])) > 0)
    
    print(f"Projects with non-empty assets: {projects_with_assets}")
    print(f"Projects with non-empty cardasset: {projects_with_cardasset}")
    
    # Show a few examples
    print("\nSample entries:")
    for i, p in enumerate(all_projects[:3], 1):
        print(f"\n{i}. {p.get('title')}")
        print(f"   Assets: {p.get('assets', [])}")
        print(f"   Cardasset: {p.get('cardasset', [])}")

if __name__ == "__main__":
    print("Cleaning up sample data...")
    clean_sample_data()
    print("\nSetting up MongoDB collections...")
    setup_database()
    print("\n" + "="*50)
    print("Inserting projects from JSON file...")
    insert_projects()
    print("\n" + "="*50)
    verify_insertion()
    print("\n" + "="*50)
    check_database_state()
    print("\n" + "="*50)
    print("MongoDB setup completed successfully!")