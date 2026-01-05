from pymongo import MongoClient

MONGO_URI = "mongodb+srv://kunal:kunal@cluster0.d00uuq3.mongodb.net/mydb?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)

# Get databases
content_platform_db = client["content_platform"]
portfolio_db = client["Portfolio"]

# Get collections
old_users = content_platform_db["users"]
new_users = portfolio_db["users"]

# Copy user to Portfolio DB
user = old_users.find_one({"username": "kunalpro379"})

if user:
    # Check if already exists in Portfolio
    existing = new_users.find_one({"username": "kunalpro379"})
    
    if not existing:
        new_users.insert_one(user)
        print("User copied to Portfolio DB successfully!")
    else:
        print("User already exists in Portfolio DB")
else:
    print("User not found in content_platform DB")

# Create index
new_users.create_index("username", unique=True)
print("Index created on username")
