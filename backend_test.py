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

class FirebaseBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.valid_token = None
        self.invalid_token = "invalid_token_12345"
        
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
    
    def test_basic_endpoints(self):
        """Test basic API endpoints that don't require authentication"""
        print("\n=== Testing Basic Endpoints ===")
        
        # Test GET /api/
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    self.log_test("GET /api/", True, "Basic health check working")
                else:
                    self.log_test("GET /api/", False, "Unexpected response format", {"response": data})
            else:
                self.log_test("GET /api/", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/", False, f"Connection error: {str(e)}")
    
    def test_status_endpoints(self):
        """Test status check endpoints"""
        print("\n=== Testing Status Endpoints ===")
        
        # Test POST /api/status
        try:
            test_data = {"client_name": "test_client_backend_api"}
            response = requests.post(f"{self.base_url}/status", json=test_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data.get("client_name") == "test_client_backend_api":
                    self.log_test("POST /api/status", True, "Status creation working")
                else:
                    self.log_test("POST /api/status", False, "Invalid response format", {"response": data})
            else:
                self.log_test("POST /api/status", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("POST /api/status", False, f"Connection error: {str(e)}")
        
        # Test GET /api/status
        try:
            response = requests.get(f"{self.base_url}/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/status", True, f"Status retrieval working, found {len(data)} records")
                else:
                    self.log_test("GET /api/status", False, "Response should be a list", {"response": data})
            else:
                self.log_test("GET /api/status", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_test("GET /api/status", False, f"Connection error: {str(e)}")
    
    def test_authentication_validation(self):
        """Test Firebase authentication token validation"""
        print("\n=== Testing Authentication Validation ===")
        
        # Test protected route without token
        try:
            response = requests.get(f"{self.base_url}/protected", timeout=10)
            if response.status_code == 403:
                self.log_test("Protected route without token", True, "Correctly rejected unauthenticated request")
            elif response.status_code == 401:
                self.log_test("Protected route without token", True, "Correctly rejected unauthenticated request (401)")
            else:
                self.log_test("Protected route without token", False, f"Should return 401/403, got {response.status_code}")
        except Exception as e:
            self.log_test("Protected route without token", False, f"Connection error: {str(e)}")
        
        # Test protected route with invalid token
        try:
            headers = {"Authorization": f"Bearer {self.invalid_token}"}
            response = requests.get(f"{self.base_url}/protected", headers=headers, timeout=10)
            if response.status_code in [401, 403]:
                self.log_test("Protected route with invalid token", True, "Correctly rejected invalid token")
            else:
                self.log_test("Protected route with invalid token", False, f"Should return 401/403, got {response.status_code}")
        except Exception as e:
            self.log_test("Protected route with invalid token", False, f"Connection error: {str(e)}")
    
    def test_user_profile_endpoints_without_auth(self):
        """Test user profile endpoints without authentication"""
        print("\n=== Testing User Profile Endpoints (No Auth) ===")
        
        endpoints = [
            ("GET", "/user/profile", "Get user profile"),
            ("POST", "/user/profile", "Create user profile"),
            ("PUT", "/user/profile", "Update user profile"),
            ("DELETE", "/user/profile", "Delete user profile")
        ]
        
        for method, endpoint, description in endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                elif method == "POST":
                    response = requests.post(f"{self.base_url}{endpoint}", json={"phone_number": "123-456-7890"}, timeout=10)
                elif method == "PUT":
                    response = requests.put(f"{self.base_url}{endpoint}", json={"display_name": "Test User"}, timeout=10)
                elif method == "DELETE":
                    response = requests.delete(f"{self.base_url}{endpoint}", timeout=10)
                
                if response.status_code in [401, 403]:
                    self.log_test(f"{method} {endpoint} (no auth)", True, f"{description} correctly requires authentication")
                else:
                    self.log_test(f"{method} {endpoint} (no auth)", False, f"Should require auth, got {response.status_code}")
            except Exception as e:
                self.log_test(f"{method} {endpoint} (no auth)", False, f"Connection error: {str(e)}")
    
    def test_user_profile_endpoints_with_invalid_auth(self):
        """Test user profile endpoints with invalid authentication"""
        print("\n=== Testing User Profile Endpoints (Invalid Auth) ===")
        
        headers = {"Authorization": f"Bearer {self.invalid_token}"}
        endpoints = [
            ("GET", "/user/profile", "Get user profile"),
            ("POST", "/user/profile", "Create user profile"),
            ("PUT", "/user/profile", "Update user profile"),
            ("DELETE", "/user/profile", "Delete user profile")
        ]
        
        for method, endpoint, description in endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", headers=headers, timeout=10)
                elif method == "POST":
                    response = requests.post(f"{self.base_url}{endpoint}", headers=headers, json={"phone_number": "123-456-7890"}, timeout=10)
                elif method == "PUT":
                    response = requests.put(f"{self.base_url}{endpoint}", headers=headers, json={"display_name": "Test User"}, timeout=10)
                elif method == "DELETE":
                    response = requests.delete(f"{self.base_url}{endpoint}", headers=headers, timeout=10)
                
                if response.status_code in [401, 403]:
                    self.log_test(f"{method} {endpoint} (invalid auth)", True, f"{description} correctly rejects invalid token")
                else:
                    self.log_test(f"{method} {endpoint} (invalid auth)", False, f"Should reject invalid token, got {response.status_code}")
            except Exception as e:
                self.log_test(f"{method} {endpoint} (invalid auth)", False, f"Connection error: {str(e)}")
    
    def test_mongodb_integration(self):
        """Test MongoDB integration by checking data persistence"""
        print("\n=== Testing MongoDB Integration ===")
        
        # Test data persistence with status checks
        try:
            # Create a unique status check
            unique_client = f"mongodb_test_{uuid.uuid4().hex[:8]}"
            test_data = {"client_name": unique_client}
            
            # Create status check
            response = requests.post(f"{self.base_url}/status", json=test_data, timeout=10)
            if response.status_code == 200:
                created_data = response.json()
                created_id = created_data.get("id")
                
                # Retrieve all status checks and verify our data exists
                response = requests.get(f"{self.base_url}/status", timeout=10)
                if response.status_code == 200:
                    all_status = response.json()
                    found = any(status.get("client_name") == unique_client for status in all_status)
                    
                    if found:
                        self.log_test("MongoDB data persistence", True, "Data successfully stored and retrieved from MongoDB")
                    else:
                        self.log_test("MongoDB data persistence", False, "Created data not found in retrieval")
                else:
                    self.log_test("MongoDB data persistence", False, f"Failed to retrieve data: HTTP {response.status_code}")
            else:
                self.log_test("MongoDB data persistence", False, f"Failed to create data: HTTP {response.status_code}")
        except Exception as e:
            self.log_test("MongoDB data persistence", False, f"MongoDB integration error: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for various scenarios"""
        print("\n=== Testing Error Handling ===")
        
        # Test invalid JSON for POST requests
        try:
            response = requests.post(f"{self.base_url}/status", data="invalid json", 
                                   headers={"Content-Type": "application/json"}, timeout=10)
            if response.status_code == 422:  # FastAPI validation error
                self.log_test("Invalid JSON handling", True, "Correctly handles invalid JSON")
            else:
                self.log_test("Invalid JSON handling", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Invalid JSON handling", False, f"Error: {str(e)}")
        
        # Test missing required fields
        try:
            response = requests.post(f"{self.base_url}/status", json={}, timeout=10)
            if response.status_code == 422:  # FastAPI validation error
                self.log_test("Missing required fields", True, "Correctly validates required fields")
            else:
                self.log_test("Missing required fields", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Missing required fields", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Firebase Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_basic_endpoints()
        self.test_status_endpoints()
        self.test_authentication_validation()
        self.test_user_profile_endpoints_without_auth()
        self.test_user_profile_endpoints_with_invalid_auth()
        self.test_mongodb_integration()
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
    tester = FirebaseBackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)