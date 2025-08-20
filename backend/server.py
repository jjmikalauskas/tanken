from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, auth

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firebase Admin initialization
firebase_service_account = {
    "type": "service_account",
    "project_id": "mongoose2-app",
    "private_key_id": "1c4b91873ec1fae8da3b363554d9a6148cd9b81b",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9x2gtq2u8xme/\nL/vFvMdhW6IZ457T3fAu0IlB0YTbNWDjw+yogBvJoFqA48iiN3Z6OLv42UUU8xm9\nj3FIpSf072jRHGOHmbvRPCzRli9WOH/pVCmQCLYY+xpiO0nf8Bz5hvJ0+ooc1Bmd\nYkOj2M1RNVsGcDICufb77nwVYX3d9BqQcLdmoF92TpX59Ar48gZb13c8QHzmmNuf\nFbMQshPZuBZjFbiZt5hqdjD3NqzJx/z5f0ej/YKMOG++ekMkhq4I/euhmRdLaFP9\nMxldpstAtaLINf5iOoutcJvHYFmRmHtQaMAsRSzfsGNPX+77uLAzYdeejUezWFyZ\n5aveNVC/AgMBAAECggEAXfLG4IDxk2DXAD8lURTs0QYXX+Cegnzmx44lvMcXkZtB\nrU+TKzFMUErJMvBQpPl29fd7GqyYddAI6J4HszJLbwZL6eU3YmwZHfI/r7u9EF5k\n+CHZd3vQhdpdC88U+b644VBMW9uhnrbjPVXlbUnJDpAu0SeeolnkaoB7vevm7wZr\nzJhZ3t4auaOt/+kI9hgX5g6aJCrE/JlDpdyeSODdzFcJp6ZB+CtBPZFTjlrLHDu5\n3BKGfikCZSiEPtTUuUwQQWwPhiJ71hhVk5kYlsjEy368nnN8DoydvzMxI+ClGFvy\nF1UH/kiHaEgFe1HnsGzfoXC5Qem3JFaV2/p4NV+4HQKBgQDoWluP/GlbgIiYRP3F\nm9HgZifNK3c18+p96zhPITRL/KZ0CFWrmF4QK2wBCFCvQYpsqB6FWGyrUcJ8wHuE\nZa6w9ejZOU4fOySV4R2Aj+pQi0VfMSiPUI/QP5UcSwBLVfq6eaQoVHrnEv+Vmwje\nqUuYc/f/BjqECwzPQssxhfk3pQKBgQDRF9cvYfoujUM67f3HqC5Q5Dlk1bzB5qZc\n66E7IQwcVtCbgwdWfcuSiXvHqTCRq73kdxuj8DxMyyv9sGrr4QIGihsvAmmr9Sq0\nSlN7UTkaffyfMOZAuRreHiqXUagwJ5rwztIzsUOO5WGKO5s2EXVDWVJRjbLiOa6t\nPdnNARpZkwKBgEkCg3zl8nEnHUTDgP5D7RnW37DPdKEGaOtyKvpqU5WA6QjSyaCm\nuv/XtRNJ+phnPsjPtu9tjo/ym+s5TFaY4OCIFMeVAyA7JE7YMr3/+r+eU4kK2FTY\nGqh0IjWGt6v0c1l++X8WtJvBU4A9+/aDOdbIsed3nJF7K2ZA9bo0/89lAoGBAM96\nj61V1JIy3F5yX9upd+QOwyDaskXZ4ITdz4xD26eXQcK+fx6FDubmg6v4p9g0ieZV\nhljjfoJZLNq8HyzWhlME4bqA82iNi4WBJ1t7mmU+VNmGBUR+KTn0xyCGB5VZB3ci\nUxS2NipqVKJ9SSOaqThePr/sEnBG+pyvfhrdmE7/AoGBAL33F0+yHZ+0w/Bs6suH\nQyrWzW1fxhgHTwWiW7t5x3SwR2KTDFx0Jo5Pb0HlwvbxSugjt1fzMJMlysoQBtRz\nklYnBQQr3iG+hw/7Ow1DlNl4GwABQHhVhiSw6hnaOsEQz8K6F4+2wuY766RsKGIi\nLbXr6eQncyRXBb3XVWH9h76s\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@mongoose2-app.iam.gserviceaccount.com",
    "client_id": "115431696533845226827",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mongoose2-app.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

# Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_service_account)
    firebase_admin.initialize_app(cred)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Firebase auth dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class UserProfile(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    phone_number: Optional[str] = None
    address: Optional[str] = None

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

class Restaurant(BaseModel):
    restaurant_name: str
    street_address: str
    city: str
    state: str
    zipcode: str
    primary_phone: str
    website_url: Optional[str] = None
    gm_name: Optional[str] = None
    gm_phone: Optional[str] = None
    secondary_phone: Optional[str] = None
    third_phone: Optional[str] = None
    doordash_url: Optional[str] = None
    uber_eats_url: Optional[str] = None
    grubhub_url: Optional[str] = None
    notes: Optional[str] = None
    restaurant_key: str
    created_at: str
    updated_at: str

class RestaurantCreate(BaseModel):
    restaurantName: str
    streetAddress: str
    city: str
    state: str
    zipcode: str
    primaryPhone: str
    websiteUrl: Optional[str] = None
    gmName: Optional[str] = None
    gmPhone: Optional[str] = None
    secondaryPhone: Optional[str] = None
    thirdPhone: Optional[str] = None
    doordashUrl: Optional[str] = None
    uberEatsUrl: Optional[str] = None
    grubhubUrl: Optional[str] = None
    notes: Optional[str] = None
    restaurantKey: str
    createdAt: str
    updatedAt: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# User Profile Routes
@api_router.post("/user/profile", response_model=UserProfile)
async def create_user_profile(
    profile_data: UserProfileCreate,
    current_user = Depends(get_current_user)
):
    """Create or update user profile"""
    user_profile = UserProfile(
        uid=current_user['uid'],
        email=current_user['email'],
        display_name=current_user.get('name'),
        phone_number=profile_data.phone_number,
        address=profile_data.address
    )
    
    # Upsert the profile
    await db.user_profiles.replace_one(
        {"uid": current_user['uid']},
        user_profile.dict(),
        upsert=True
    )
    
    return user_profile

@api_router.get("/user/profile", response_model=UserProfile)
async def get_user_profile(current_user = Depends(get_current_user)):
    """Get current user's profile"""
    profile = await db.user_profiles.find_one({"uid": current_user['uid']})
    
    if not profile:
        # Create a basic profile if it doesn't exist
        user_profile = UserProfile(
            uid=current_user['uid'],
            email=current_user['email'],
            display_name=current_user.get('name')
        )
        await db.user_profiles.insert_one(user_profile.dict())
        return user_profile
    
    return UserProfile(**profile)

@api_router.put("/user/profile", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user = Depends(get_current_user)
):
    """Update user profile"""
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.user_profiles.update_one(
        {"uid": current_user['uid']},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Return updated profile
    profile = await db.user_profiles.find_one({"uid": current_user['uid']})
    return UserProfile(**profile)

@api_router.delete("/user/profile")
async def delete_user_profile(current_user = Depends(get_current_user)):
    """Delete user profile"""
    result = await db.user_profiles.delete_one({"uid": current_user['uid']})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile deleted successfully"}

# Restaurant Routes
@api_router.post("/restaurants")
async def create_restaurant(restaurant_data: RestaurantCreate):
    """Create a new restaurant entry"""
    try:
        # Convert frontend camelCase to backend snake_case for storage
        restaurant_dict = {
            "restaurant_name": restaurant_data.restaurantName,
            "street_address": restaurant_data.streetAddress,
            "city": restaurant_data.city,
            "state": restaurant_data.state,
            "zipcode": restaurant_data.zipcode,
            "primary_phone": restaurant_data.primaryPhone,
            "website_url": restaurant_data.websiteUrl,
            "gm_name": restaurant_data.gmName,
            "gm_phone": restaurant_data.gmPhone,
            "secondary_phone": restaurant_data.secondaryPhone,
            "third_phone": restaurant_data.thirdPhone,
            "doordash_url": restaurant_data.doordashUrl,
            "uber_eats_url": restaurant_data.uberEatsUrl,
            "grubhub_url": restaurant_data.grubhubUrl,
            "notes": restaurant_data.notes,
            "restaurant_key": restaurant_data.restaurantKey,
            "created_at": restaurant_data.createdAt,
            "updated_at": restaurant_data.updatedAt,
        }
        
        # Insert into MongoDB
        result = await db.restaurants.insert_one(restaurant_dict)
        
        return {
            "success": True,
            "id": str(result.inserted_id),
            "restaurant_key": restaurant_data.restaurantKey,
            "message": f"Restaurant '{restaurant_data.restaurantName}' saved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error saving restaurant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save restaurant: {str(e)}")

@api_router.get("/restaurants")
async def get_restaurants():
    """Get all restaurants"""
    try:
        restaurants = await db.restaurants.find().to_list(1000)
        # Convert ObjectId to string for JSON serialization
        for restaurant in restaurants:
            restaurant["_id"] = str(restaurant["_id"])
        return {"restaurants": restaurants, "count": len(restaurants)}
    except Exception as e:
        logger.error(f"Error fetching restaurants: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch restaurants: {str(e)}")

@api_router.get("/restaurants/{restaurant_key}")
async def get_restaurant_by_key(restaurant_key: str):
    """Get restaurant by key"""
    try:
        restaurant = await db.restaurants.find_one({"restaurant_key": restaurant_key})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        restaurant["_id"] = str(restaurant["_id"])
        return restaurant
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching restaurant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch restaurant: {str(e)}")

# MongoDB Admin Routes
@api_router.get("/admin/restaurants")
async def admin_get_restaurants():
    """Admin endpoint to get all restaurants with full details"""
    try:
        restaurants = await db.restaurants.find().to_list(1000)
        
        # Convert ObjectId to string and add stats
        for restaurant in restaurants:
            restaurant["_id"] = str(restaurant["_id"])
        
        # Get some stats
        cities = set([r.get("city", "Unknown") for r in restaurants])
        states = set([r.get("state", "Unknown") for r in restaurants])
        
        return {
            "restaurants": restaurants,
            "stats": {
                "total_count": len(restaurants),
                "cities_covered": len(cities),
                "states_covered": len(states),
                "cities": list(cities),
                "states": list(states)
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin restaurants: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch restaurants: {str(e)}")

@api_router.get("/admin/database-stats")
async def admin_database_stats():
    """Get database statistics"""
    try:
        # Get collection names
        collections = await db.list_collection_names()
        
        # Get counts for each collection
        collection_stats = {}
        for collection_name in collections:
            count = await db[collection_name].count_documents({})
            collection_stats[collection_name] = count
        
        return {
            "collections": collections,
            "collection_stats": collection_stats,
            "total_collections": len(collections)
        }
        
    except Exception as e:
        logger.error(f"Error fetching database stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch database stats: {str(e)}")

@api_router.delete("/admin/restaurants/{restaurant_id}")
async def admin_delete_restaurant(restaurant_id: str):
    """Delete a restaurant (admin only)"""
    try:
        from bson import ObjectId
        
        # Convert string ID to ObjectId
        object_id = ObjectId(restaurant_id)
        
        result = await db.restaurants.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        return {"success": True, "message": f"Restaurant {restaurant_id} deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting restaurant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete restaurant: {str(e)}")

# Protected route example
@api_router.get("/protected")
async def protected_route(current_user = Depends(get_current_user)):
    return {
        "message": f"Hello {current_user.get('name', current_user['email'])}!",
        "uid": current_user['uid'],
        "email": current_user['email']
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()