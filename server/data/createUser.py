from pymongo import MongoClient
import bcrypt
from datetime import datetime

# MongoDB connection (Atlas)
MONGO_URI = "mongodb+srv://kunal:kunal@cluster0.d00uuq3.mongodb.net/mydb?retryWrites=true&w=majority"
DB_NAME = "Portfolio"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users = db["users"]

# Create unique index on username
users.create_index("username", unique=True)


def register_user(username: str, password: str):
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(rounds=12)
    )

    user = {
        "username": username,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }

    try:
        users.insert_one(user)
        print("User registered successfully")
    except Exception as e:
        print("Error:", e)


def authenticate_user(username: str, password: str) -> bool:
    user = users.find_one({"username": username})

    if not user:
        print("User not found")
        return False

    if bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"]
    ):
        print("Authentication successful")
        return True
    else:
        print("Invalid password")
        return False


if __name__ == "__main__":
    # Register user (run once)
    register_user("kunalpro379", "Lawm@822471")

    # Authenticate user
    authenticate_user("kunalpro379", "Lawm@822471")
