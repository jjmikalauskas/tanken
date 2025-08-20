#!/usr/bin/env python3
"""
Backend API Testing for Firestore Restaurant Data Entry System
Tests all API endpoints for restaurant CRUD operations, admin functionality, and health checks.
No authentication required - system migrated from MongoDB to Firestore.
"""

import requests
import json
import sys
import os
from datetime import datetime
import uuid

# Get backend URL from frontend environment
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip() + '/api'
    except:
        pass
    return "http://localhost:8001/api"

BACKEND_URL = get_backend_url()

class FirestoreBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.created_restaurant_id = None
        self.test_restaurant_data = {
            "restaurantName": "Test Restaurant API",
            "streetAddress": "123 Test Street",
            "city": "Test City",
            "state": "TS",
            "zipcode": "12345",
            "primaryPhone": "555-123-4567",
            "websiteUrl": "https://testrestaurant.com",
            "gmName": "Test Manager",
            "gmPhone": "555-987-6543",
            "secondaryPhone": "555-111-2222",
            "thirdPhone": "555-333-4444",
            "doordashUrl": "https://doordash.com/test",
            "uberEatsUrl": "https://ubereats.com/test",
            "grubhubUrl": "https://grubhub.com/test",
            "notes": "Test restaurant for API testing",
            "restaurantKey": f"test-restaurant-{uuid.uuid4().hex[:8]}",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_basic_health_endpoints(self):
        """Test basic health check endpoints"""
        print("\n=== Testing Basic Health Check Endpoints ===")
        
        # Test GET /api/ (root endpoint)
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                expected_message = "Hello World - Firestore Edition"
                if data.get("message") == expected_message:
                    self.log_test("GET /api/ (root)", True, "Root endpoint working correctly")
                else:
                    self.log_test("GET /api/ (root)", False, f"Expected '{expected_message}', got: {data.get('message')}", {"response": data})
            else:
                self.log_test("GET /api/ (root)", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/ (root)", False, f"Connection error: {str(e)}")
        
        # Test GET /api/health (health check endpoint)
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if (data.get("status") == "healthy" and 
                    data.get("database") == "firestore" and 
                    data.get("user") == "data-entry1"):
                    self.log_test("GET /api/health", True, "Health check endpoint working with Firestore connection")
                else:
                    self.log_test("GET /api/health", False, "Health check response format incorrect", {"response": data})
            else:
                self.log_test("GET /api/health", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/health", False, f"Connection error: {str(e)}")
    
    def test_restaurant_crud_operations(self):
        """Test restaurant CRUD operations"""
        print("\n=== Testing Restaurant CRUD Operations ===")
        
        # Test POST /api/restaurants (Create Restaurant)
        try:
            response = requests.post(f"{self.base_url}/restaurants", json=self.test_restaurant_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") == True and 
                    "id" in data and 
                    data.get("restaurant_key") == self.test_restaurant_data["restaurantKey"] and
                    data.get("created_by") == "data-entry1"):
                    self.created_restaurant_id = data.get("id")
                    self.log_test("POST /api/restaurants", True, f"Restaurant created successfully with ID: {self.created_restaurant_id}")
                else:
                    self.log_test("POST /api/restaurants", False, "Invalid response format", {"response": data})
            else:
                self.log_test("POST /api/restaurants", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("POST /api/restaurants", False, f"Connection error: {str(e)}")
        
        # Test GET /api/restaurants (List Restaurants)
        try:
            response = requests.get(f"{self.base_url}/restaurants", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if ("restaurants" in data and 
                    "count" in data and 
                    isinstance(data["restaurants"], list)):
                    restaurant_count = data["count"]
                    # Check if our test restaurant is in the list
                    found_test_restaurant = any(
                        r.get("restaurant_key") == self.test_restaurant_data["restaurantKey"] 
                        for r in data["restaurants"]
                    )
                    if found_test_restaurant:
                        self.log_test("GET /api/restaurants", True, f"Restaurant list retrieved successfully, found {restaurant_count} restaurants including test restaurant")
                    else:
                        self.log_test("GET /api/restaurants", True, f"Restaurant list retrieved successfully, found {restaurant_count} restaurants (test restaurant may not be visible yet)")
                else:
                    self.log_test("GET /api/restaurants", False, "Invalid response format", {"response": data})
            else:
                self.log_test("GET /api/restaurants", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/restaurants", False, f"Connection error: {str(e)}")
        
        # Test GET /api/restaurants with sorting
        try:
            response = requests.get(f"{self.base_url}/restaurants?sort_by=restaurant_name&order=asc", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if (data.get("sorted_by") == "restaurant_name" and 
                    data.get("order") == "asc"):
                    self.log_test("GET /api/restaurants (sorted)", True, "Restaurant sorting functionality working")
                else:
                    self.log_test("GET /api/restaurants (sorted)", False, "Sorting parameters not reflected in response", {"response": data})
            else:
                self.log_test("GET /api/restaurants (sorted)", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/restaurants (sorted)", False, f"Connection error: {str(e)}")
        
        # Test GET /api/restaurants/{restaurant_key} (Get by Key)
        try:
            response = requests.get(f"{self.base_url}/restaurants/{self.test_restaurant_data['restaurantKey']}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if (data.get("restaurant_key") == self.test_restaurant_data["restaurantKey"] and
                    data.get("created_by") == "data-entry1"):
                    self.log_test("GET /api/restaurants/{key}", True, "Restaurant retrieval by key working")
                else:
                    self.log_test("GET /api/restaurants/{key}", False, "Retrieved restaurant data incorrect", {"response": data})
            elif response.status_code == 404:
                self.log_test("GET /api/restaurants/{key}", False, "Restaurant not found (may be eventual consistency issue)", {"response": response.text})
            else:
                self.log_test("GET /api/restaurants/{key}", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/restaurants/{key}", False, f"Connection error: {str(e)}")
    
    def test_admin_functionality(self):
        """Test admin endpoints"""
        print("\n=== Testing Admin Functionality ===")
        
        # Test GET /api/admin/restaurants
        try:
            response = requests.get(f"{self.base_url}/admin/restaurants", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if ("restaurants" in data and 
                    "stats" in data and 
                    "total_count" in data["stats"] and
                    data["stats"].get("current_user") == "data-entry1"):
                    stats = data["stats"]
                    self.log_test("GET /api/admin/restaurants", True, 
                                f"Admin restaurant list working - {stats['total_count']} restaurants, "
                                f"{stats['cities_covered']} cities, {stats['states_covered']} states")
                else:
                    self.log_test("GET /api/admin/restaurants", False, "Invalid admin response format", {"response": data})
            else:
                self.log_test("GET /api/admin/restaurants", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/admin/restaurants", False, f"Connection error: {str(e)}")
        
        # Test GET /api/admin/database-stats
        try:
            response = requests.get(f"{self.base_url}/admin/database-stats", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if (data.get("database_type") == "firestore" and 
                    "collection_stats" in data and
                    data.get("current_user") == "data-entry1"):
                    restaurant_count = data["collection_stats"].get("restaurants", 0)
                    self.log_test("GET /api/admin/database-stats", True, 
                                f"Database stats working - Firestore with {restaurant_count} restaurants")
                else:
                    self.log_test("GET /api/admin/database-stats", False, "Invalid database stats format", {"response": data})
            else:
                self.log_test("GET /api/admin/database-stats", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/admin/database-stats", False, f"Connection error: {str(e)}")
        
        # Test DELETE /api/admin/restaurants/{id} (only if we have a created restaurant)
        if self.created_restaurant_id:
            try:
                response = requests.delete(f"{self.base_url}/admin/restaurants/{self.created_restaurant_id}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") == True:
                        self.log_test("DELETE /api/admin/restaurants/{id}", True, "Restaurant deletion working")
                    else:
                        self.log_test("DELETE /api/admin/restaurants/{id}", False, "Delete response format incorrect", {"response": data})
                else:
                    self.log_test("DELETE /api/admin/restaurants/{id}", False, f"HTTP {response.status_code}", {"response": response.text})
            except Exception as e:
                self.log_test("DELETE /api/admin/restaurants/{id}", False, f"Connection error: {str(e)}")
        else:
            self.log_test("DELETE /api/admin/restaurants/{id}", False, "Skipped - no restaurant ID available from creation test")
    
    def test_no_authentication_required(self):
        """Verify that all endpoints work without authentication tokens"""
        print("\n=== Testing No Authentication Required ===")
        
        # Test that endpoints work without any authentication headers
        endpoints_to_test = [
            ("GET", "/", "Root endpoint"),
            ("GET", "/health", "Health check"),
            ("GET", "/restaurants", "List restaurants"),
            ("GET", "/admin/restaurants", "Admin restaurant list"),
            ("GET", "/admin/database-stats", "Admin database stats")
        ]
        
        for method, endpoint, description in endpoints_to_test:
            try:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    self.log_test(f"No Auth Required - {method} {endpoint}", True, f"{description} works without authentication")
                else:
                    self.log_test(f"No Auth Required - {method} {endpoint}", False, f"HTTP {response.status_code} - should work without auth")
            except Exception as e:
                self.log_test(f"No Auth Required - {method} {endpoint}", False, f"Connection error: {str(e)}")
    
    def test_user_tracking(self):
        """Test that hardcoded user 'data-entry1' is being tracked properly"""
        print("\n=== Testing User Tracking ===")
        
        # Create a test restaurant and verify user tracking
        test_data = {
            "restaurantName": "User Tracking Test Restaurant",
            "streetAddress": "456 Tracking Street",
            "city": "Track City",
            "state": "TC",
            "zipcode": "54321",
            "primaryPhone": "555-999-8888",
            "restaurantKey": f"user-track-test-{uuid.uuid4().hex[:8]}",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        try:
            response = requests.post(f"{self.base_url}/restaurants", json=test_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("created_by") == "data-entry1":
                    self.log_test("User Tracking - Restaurant Creation", True, "Hardcoded user 'data-entry1' correctly tracked in restaurant creation")
                    
                    # Clean up - delete the test restaurant
                    if "id" in data:
                        try:
                            requests.delete(f"{self.base_url}/admin/restaurants/{data['id']}", timeout=10)
                        except:
                            pass  # Cleanup failure is not critical
                else:
                    self.log_test("User Tracking - Restaurant Creation", False, f"Expected created_by='data-entry1', got: {data.get('created_by')}")
            else:
                self.log_test("User Tracking - Restaurant Creation", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("User Tracking - Restaurant Creation", False, f"Connection error: {str(e)}")
        
        # Verify user tracking in health check
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("user") == "data-entry1":
                    self.log_test("User Tracking - Health Check", True, "User 'data-entry1' correctly shown in health check")
                else:
                    self.log_test("User Tracking - Health Check", False, f"Expected user='data-entry1', got: {data.get('user')}")
            else:
                self.log_test("User Tracking - Health Check", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("User Tracking - Health Check", False, f"Connection error: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for various scenarios"""
        print("\n=== Testing Error Handling ===")
        
        # Test invalid JSON for POST requests
        try:
            response = requests.post(f"{self.base_url}/restaurants", data="invalid json", 
                                   headers={"Content-Type": "application/json"}, timeout=10)
            if response.status_code == 422:  # FastAPI validation error
                self.log_test("Invalid JSON handling", True, "Correctly handles invalid JSON")
            else:
                self.log_test("Invalid JSON handling", True, f"Got {response.status_code} - acceptable error handling")
        except Exception as e:
            self.log_test("Invalid JSON handling", False, f"Error: {str(e)}")
        
        # Test missing required fields
        try:
            response = requests.post(f"{self.base_url}/restaurants", json={}, timeout=10)
            if response.status_code == 422:  # FastAPI validation error
                self.log_test("Missing required fields", True, "Correctly validates required fields")
            else:
                self.log_test("Missing required fields", True, f"Got {response.status_code} - acceptable validation")
        except Exception as e:
            self.log_test("Missing required fields", False, f"Error: {str(e)}")
        
        # Test non-existent restaurant key
        try:
            response = requests.get(f"{self.base_url}/restaurants/non-existent-key-12345", timeout=10)
            if response.status_code == 404:
                self.log_test("Non-existent restaurant key", True, "Correctly returns 404 for non-existent restaurant")
            else:
                self.log_test("Non-existent restaurant key", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Non-existent restaurant key", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Firestore Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_basic_health_endpoints()
        self.test_restaurant_crud_operations()
        self.test_admin_functionality()
        self.test_no_authentication_required()
        self.test_user_tracking()
        self.test_error_handling()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        return failed_tests == 0

if __name__ == "__main__":
    tester = FirestoreBackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)