import json
import random
import string
from pymongo import MongoClient, ASCENDING
from datetime import datetime
from bson import ObjectId

MONGO_URI = "mongodb+srv://kunal:kunal@cluster0.d00uuq3.mongodb.net/mydb?retryWrites=true&w=majority"
DB_NAME = "Portfolio"

def generate_blog_id():
    """Generate random 10 character ID (letters + digits)"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(10))

def insert_blogs():
    """Insert blogs from JSON file"""
    try:
        with open('blogs.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: blogs.json file not found!")
        return
    except json.JSONDecodeError:
        print("Error: Invalid JSON in blogs.json!")
        return
    
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    blogs_collection = db['blogs']
    
    # Delete sample documents
    blogs_collection.delete_many({"title": {"$regex": "^Sample"}})
    
    blogs_to_insert = []
    
    if "blogs" in data:
        for blog in data["blogs"]:
            slug = blog["title"].lower().replace(" ", "-").replace(".", "-").replace("(", "").replace(")", "")
            
            # Parse datetime
            blog_datetime = datetime.strptime(blog["datetime"], "%Y-%m-%d") if blog.get("datetime") else datetime.utcnow()
            
            doc = {
                "_id": ObjectId(),
                "blogId": generate_blog_id(),
                "title": blog["title"],
                "slug": slug,
                "tagline": blog.get("tagline", ""),
                "subject": blog.get("subject", ""),
                "shortDescription": blog.get("shortDescription", ""),
                "tags": blog.get("tags", []),
                "datetime": blog_datetime,
                "assets": blog.get("assets", []),
                "mdFiles": blog.get("mdFiles", []),
                "coverImage": blog.get("coverImage", ""),
                "footer": blog.get("footer", ""),
                "blogLinks": blog.get("blogLinks", []),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "featured": False
            }
            blogs_to_insert.append(doc)
    
    if blogs_to_insert:
        result = blogs_collection.insert_many(blogs_to_insert)
        print(f"Successfully inserted {len(result.inserted_ids)} blogs into MongoDB")
        
        print("\nSample blog IDs created:")
        for i, doc in enumerate(blogs_to_insert[:3]):
            print(f"{i+1}. {doc['title']}: {doc['blogId']}")
    else:
        print("No blogs found to insert")

def setup_blog_indexes():
    """Setup blog collection indexes"""
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    blogs_collection = db['blogs']
    
    indexes = ["slug", "blogId", "datetime", "subject", "tags"]
    
    for field in indexes:
        try:
            blogs_collection.create_index([(field, ASCENDING)])
            print(f"Index created on '{field}'")
        except Exception as e:
            print(f"Error creating index on '{field}': {e}")

def verify_blogs():
    """Verify inserted blogs"""
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    blogs_collection = db['blogs']
    
    print("\n" + "="*50)
    print("Verifying inserted blogs:")
    print("="*50)
    
    total = blogs_collection.count_documents({})
    print(f"Total blogs in database: {total}")
    
    real_count = blogs_collection.count_documents({"blogId": {"$exists": True}})
    print(f"Real blogs (with blogId): {real_count}")
    
    print("\nFirst 3 blogs:")
    blogs = blogs_collection.find({"blogId": {"$exists": True}}).limit(3)
    for i, b in enumerate(blogs, 1):
        print(f"\n{i}. {b['title']}")
        print(f"   ID: {b['blogId']}")
        print(f"   Subject: {b.get('subject', 'N/A')}")
        print(f"   Assets: {len(b.get('assets', []))} items")
        print(f"   Cover Image: {'Yes' if b.get('coverImage') else 'No'}")

if __name__ == "__main__":
    print("Setting up blog indexes...")
    setup_blog_indexes()
    print("\n" + "="*50)
    print("Inserting blogs from JSON file...")
    insert_blogs()
    print("\n" + "="*50)
    verify_blogs()
    print("\n" + "="*50)
    print("Blog setup completed successfully!")
