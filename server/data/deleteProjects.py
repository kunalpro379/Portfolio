# quick_delete.py - Simple one-click delete
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://kunal:kunal@cluster0.d00uuq3.mongodb.net/mydb?retryWrites=true&w=majority"
DB_NAME = "Portfolio"

def quick_delete():
    """Quick delete all projects without confirmation"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        projects_collection = db['projects']
        
        # Count before
        count_before = projects_collection.count_documents({})
        print(f"📊 Found {count_before} documents")
        
        # Delete all
        result = projects_collection.delete_many({})
        
        # Count after
        count_after = projects_collection.count_documents({})
        
        print(f" Deleted {result.deleted_count} documents")
        print(f"📊 Remaining: {count_after} documents")
        
        if count_after == 0:
            print("🎉 Collection is now empty!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    quick_delete()