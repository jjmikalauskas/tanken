from fastapi import FastAPI, APIRouter, HTTPException, status
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import logging
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firebase Admin initialization with service account
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

# Initialize Firestore client
db = firestore.client()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Hardcoded user for tracking
CURRENT_USER = "data-entry1"

# Define Models
class RestaurantCreate(BaseModel):
    restaurantName: str
    streetAddress: str
    city: str
    state: str
    zipcode: str
    primaryPhone: str
    websiteUrl: Optional[str] = None
    menuUrl: Optional[str] = None
    menuComments: Optional[str] = None
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

class Restaurant(BaseModel):
    id: Optional[str] = None
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
    created_by: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Hello World - Firestore Edition"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Try to access Firestore to verify connection
        test_doc = db.collection('health_check').document('test').get()
        return {
            "status": "healthy",
            "database": "firestore",
            "user": CURRENT_USER,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Restaurant Routes
@api_router.post("/restaurants")
async def create_restaurant(restaurant_data: RestaurantCreate):
    """Create a new restaurant entry"""
    try:
        # Prepare restaurant data for Firestore storage
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
            "created_by": CURRENT_USER,  # Track user who created the entry
        }
        
        # Save to Firestore
        doc_ref = db.collection('restaurants').add(restaurant_dict)
        document_id = doc_ref[1].id
        
        logger.info(f"Restaurant saved to Firestore with ID: {document_id}")
        
        return {
            "success": True,
            "id": document_id,
            "restaurant_key": restaurant_data.restaurantKey,
            "message": f"Restaurant '{restaurant_data.restaurantName}' saved successfully to Firestore",
            "created_by": CURRENT_USER
        }
        
    except Exception as e:
        logger.error(f"Error saving restaurant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save restaurant: {str(e)}")

@api_router.get("/restaurants")
async def get_restaurants(sort_by: str = "created_at", order: str = "desc"):
    """Get all restaurants with optional sorting"""
    try:
        # Query Firestore
        restaurants_ref = db.collection('restaurants')
        
        # Apply sorting
        if sort_by in ["created_at", "updated_at", "restaurant_name"]:
            if order == "asc":
                restaurants_ref = restaurants_ref.order_by(sort_by)
            else:
                restaurants_ref = restaurants_ref.order_by(sort_by, direction=firestore.Query.DESCENDING)
        
        restaurants = []
        docs = restaurants_ref.stream()
        
        for doc in docs:
            restaurant_data = doc.to_dict()
            restaurant_data['id'] = doc.id
            restaurants.append(restaurant_data)
        
        logger.info(f"Retrieved {len(restaurants)} restaurants from Firestore")
        
        return {
            "restaurants": restaurants,
            "count": len(restaurants),
            "sorted_by": sort_by,
            "order": order
        }
        
    except Exception as e:
        logger.error(f"Error fetching restaurants: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch restaurants: {str(e)}")

@api_router.get("/restaurants/{restaurant_key}")
async def get_restaurant_by_key(restaurant_key: str):
    """Get restaurant by unique key"""
    try:
        # Query Firestore by restaurant_key
        restaurants_ref = db.collection('restaurants')
        query = restaurants_ref.where('restaurant_key', '==', restaurant_key)
        docs = list(query.stream())
        
        if not docs:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Return the first match (should be unique)
        doc = docs[0]
        restaurant_data = doc.to_dict()
        restaurant_data['id'] = doc.id
        
        return restaurant_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching restaurant by key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch restaurant: {str(e)}")

# Admin Routes
@api_router.get("/admin/restaurants")
async def admin_get_restaurants():
    """Admin endpoint to get all restaurants with statistics"""
    try:
        restaurants = []
        docs = db.collection('restaurants').stream()
        
        for doc in docs:
            restaurant_data = doc.to_dict()
            restaurant_data['id'] = doc.id
            restaurants.append(restaurant_data)
        
        # Generate statistics
        cities = set([r.get("city", "Unknown") for r in restaurants])
        states = set([r.get("state", "Unknown") for r in restaurants])
        created_by_users = set([r.get("created_by", "Unknown") for r in restaurants])
        
        return {
            "restaurants": restaurants,
            "stats": {
                "total_count": len(restaurants),
                "cities_covered": len(cities),
                "states_covered": len(states),
                "cities": list(cities),
                "states": list(states),
                "created_by_users": list(created_by_users),
                "current_user": CURRENT_USER
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin restaurants: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch restaurants: {str(e)}")

@api_router.get("/admin/database-stats")
async def admin_database_stats():
    """Get Firestore database statistics"""
    try:
        # Count documents in restaurants collection
        restaurants_count = len(list(db.collection('restaurants').stream()))
        
        return {
            "collections": ["restaurants"],
            "collection_stats": {
                "restaurants": restaurants_count
            },
            "total_collections": 1,
            "database_type": "firestore",
            "current_user": CURRENT_USER
        }
        
    except Exception as e:
        logger.error(f"Error fetching database stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch database stats: {str(e)}")

@api_router.delete("/admin/restaurants/{restaurant_id}")
async def admin_delete_restaurant(restaurant_id: str):
    """Delete a restaurant (admin only)"""
    try:
        # Delete from Firestore
        db.collection('restaurants').document(restaurant_id).delete()
        
        return {"success": True, "message": f"Restaurant {restaurant_id} deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting restaurant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete restaurant: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

# Configure CORS
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)