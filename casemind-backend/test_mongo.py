import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("MONGODB_URL")
print(f"Testing URL: {url}")

try:
    client = MongoClient(url)
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Failed to connect: {e}")
