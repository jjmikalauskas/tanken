import streamlit as st
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import pandas as pd
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# MongoDB connection
@st.cache_resource
def get_mongo_client():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    return client[os.environ['DB_NAME']]

db = get_mongo_client()

st.set_page_config(
    page_title="Restaurant Database Admin",
    page_icon="🏪",
    layout="wide"
)

st.title("🏪 Restaurant Database Admin")
st.sidebar.title("Navigation")

# Sidebar options
page = st.sidebar.selectbox("Choose a page", ["View Restaurants", "Database Stats", "Raw Data"])

if page == "View Restaurants":
    st.header("Restaurant Database")
    
    # Get restaurants data
    @st.cache_data(ttl=60)  # Cache for 1 minute
    def get_restaurants():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            restaurants = loop.run_until_complete(
                db.restaurants.find().to_list(1000)
            )
            return restaurants
        finally:
            loop.close()

    restaurants = get_restaurants()
    
    st.metric("Total Restaurants", len(restaurants))
    
    if restaurants:
        # Create a DataFrame for better display
        df_data = []
        for restaurant in restaurants:
            df_data.append({
                "Name": restaurant.get("restaurant_name", ""),
                "City": restaurant.get("city", ""),
                "State": restaurant.get("state", ""), 
                "Zipcode": restaurant.get("zipcode", ""),
                "Phone": restaurant.get("primary_phone", ""),
                "Website": restaurant.get("website_url", ""),
                "GM": restaurant.get("gm_name", ""),
                "Key": restaurant.get("restaurant_key", ""),
                "Created": restaurant.get("created_at", "")
            })
        
        df = pd.DataFrame(df_data)
        st.dataframe(df, use_container_width=True)
        
        # Detailed view
        st.subheader("Detailed Restaurant Information")
        
        for i, restaurant in enumerate(restaurants):
            with st.expander(f"📍 {restaurant.get('restaurant_name', 'Unknown')} - {restaurant.get('city', '')}, {restaurant.get('state', '')}"):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write("**Basic Information:**")
                    st.write(f"🏪 **Name:** {restaurant.get('restaurant_name', 'N/A')}")
                    st.write(f"📍 **Address:** {restaurant.get('street_address', 'N/A')}")
                    st.write(f"🏙️ **City:** {restaurant.get('city', 'N/A')}")
                    st.write(f"🗺️ **State:** {restaurant.get('state', 'N/A')}")
                    st.write(f"📮 **Zipcode:** {restaurant.get('zipcode', 'N/A')}")
                    st.write(f"📞 **Phone:** {restaurant.get('primary_phone', 'N/A')}")
                    st.write(f"🌐 **Website:** {restaurant.get('website_url', 'N/A')}")
                
                with col2:
                    st.write("**Management & Digital:**")
                    st.write(f"👨‍💼 **GM:** {restaurant.get('gm_name', 'N/A')}")
                    st.write(f"📱 **GM Phone:** {restaurant.get('gm_phone', 'N/A')}")
                    st.write(f"📞 **Secondary:** {restaurant.get('secondary_phone', 'N/A')}")
                    st.write(f"🚚 **DoorDash:** {restaurant.get('doordash_url', 'N/A')}")
                    st.write(f"🚗 **Uber Eats:** {restaurant.get('uber_eats_url', 'N/A')}")
                    st.write(f"🛵 **Grubhub:** {restaurant.get('grubhub_url', 'N/A')}")
                
                if restaurant.get('notes'):
                    st.write("**Notes:**")
                    st.write(restaurant.get('notes'))
                
                st.write("**Technical:**")
                st.code(f"Restaurant Key: {restaurant.get('restaurant_key', 'N/A')}")
                st.write(f"**Created:** {restaurant.get('created_at', 'N/A')}")
                st.write(f"**Database ID:** {restaurant.get('_id', 'N/A')}")
    else:
        st.info("No restaurants found in the database.")
        st.write("Add some restaurants using the mobile app to see them here!")

elif page == "Database Stats":
    st.header("Database Statistics")
    
    @st.cache_data(ttl=60)
    def get_stats():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            # Get collection stats
            restaurants = loop.run_until_complete(
                db.restaurants.find().to_list(1000)
            )
            
            # Get all collection names
            collections = loop.run_until_complete(
                db.list_collection_names()
            )
            
            return restaurants, collections
        finally:
            loop.close()

    restaurants, collections = get_stats()
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total Restaurants", len(restaurants))
    
    with col2:
        st.metric("Total Collections", len(collections))
    
    with col3:
        cities = set([r.get('city', 'Unknown') for r in restaurants])
        st.metric("Cities Covered", len(cities))
    
    # Collection overview
    st.subheader("Database Collections")
    for collection in collections:
        st.write(f"📄 {collection}")
    
    # Restaurant distribution by city
    if restaurants:
        st.subheader("Restaurants by City")
        city_counts = {}
        for restaurant in restaurants:
            city = restaurant.get('city', 'Unknown')
            city_counts[city] = city_counts.get(city, 0) + 1
        
        city_df = pd.DataFrame(list(city_counts.items()), columns=['City', 'Count'])
        st.bar_chart(city_df.set_index('City'))

elif page == "Raw Data":
    st.header("Raw Database Documents")
    
    collection = st.selectbox("Select Collection", ["restaurants", "status_checks", "user_profiles"])
    
    @st.cache_data(ttl=60)
    def get_raw_data(collection_name):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            data = loop.run_until_complete(
                db[collection_name].find().to_list(1000)
            )
            return data
        finally:
            loop.close()

    try:
        raw_data = get_raw_data(collection)
        
        st.metric(f"Documents in {collection}", len(raw_data))
        
        if raw_data:
            for i, doc in enumerate(raw_data):
                with st.expander(f"Document {i+1}: {doc.get('_id', 'Unknown ID')}"):
                    st.json(doc, expanded=False)
        else:
            st.info(f"No documents found in {collection} collection.")
            
    except Exception as e:
        st.error(f"Error accessing collection {collection}: {str(e)}")

# Footer
st.sidebar.markdown("---")
st.sidebar.info("🏪 Restaurant Database Admin\nBuilt with Streamlit & MongoDB")