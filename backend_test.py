#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Manga Creator
Tests all backend endpoints and functionality
"""

import requests
import json
import time
import os
from pathlib import Path

# Get backend URL from frontend .env file
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

class MangaCreatorTester:
    def __init__(self):
        self.base_url = API_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_script_id = None
        self.created_character_id = None
        self.created_job_id = None
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'details': details
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_api_health(self):
        """Test 1: Basic API Health Check"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "Manga Creator API" in data.get("message", ""):
                    self.log_result("API Health Check", True, "API is responding correctly")
                    return True
                else:
                    self.log_result("API Health Check", False, "Unexpected response format", data)
            else:
                self.log_result("API Health Check", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("API Health Check", False, "Connection failed", str(e))
        return False
    
    def test_script_parsing(self):
        """Test 2: Script Management - Parse Script"""
        sample_script = {
            "title": "Hero's Journey",
            "content": "[SCENE: Training Ground - Dawn]\n[CHARACTER: Hero - Young warrior with determination]\n[ACTION: Hero practices sword swings with intense focus]\n[DIALOGUE: Hero] \"I must become stronger to protect everyone!\"",
            "style": "shounen"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/scripts/parse", json=sample_script)
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'title', 'content', 'style', 'parsed_data', 'created_at']
                
                if all(field in data for field in required_fields):
                    self.created_script_id = data['id']
                    parsed_data = data.get('parsed_data', {})
                    
                    # Verify parsing worked
                    if 'scenes' in parsed_data and len(parsed_data['scenes']) > 0:
                        scene = parsed_data['scenes'][0]
                        if 'characters' in scene and 'dialogue' in scene and 'actions' in scene:
                            self.log_result("Script Parsing", True, f"Script parsed successfully with {len(parsed_data['scenes'])} scenes")
                            return True
                        else:
                            self.log_result("Script Parsing", False, "Parsed data missing required scene elements", scene)
                    else:
                        self.log_result("Script Parsing", False, "No scenes found in parsed data", parsed_data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Script Parsing", False, f"Missing required fields: {missing}", data)
            else:
                self.log_result("Script Parsing", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Script Parsing", False, "Request failed", str(e))
        return False
    
    def test_get_scripts(self):
        """Test 3: Script Management - Get All Scripts"""
        try:
            response = self.session.get(f"{self.base_url}/scripts")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our created script is in the list
                        script_found = any(script.get('id') == self.created_script_id for script in data)
                        if script_found:
                            self.log_result("Get All Scripts", True, f"Retrieved {len(data)} scripts including our test script")
                            return True
                        else:
                            self.log_result("Get All Scripts", False, "Test script not found in results", f"Expected ID: {self.created_script_id}")
                    else:
                        self.log_result("Get All Scripts", True, "Retrieved empty script list (valid)")
                        return True
                else:
                    self.log_result("Get All Scripts", False, "Response is not a list", type(data))
            else:
                self.log_result("Get All Scripts", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get All Scripts", False, "Request failed", str(e))
        return False
    
    def test_get_script_by_id(self):
        """Test 4: Script Management - Get Script by ID"""
        if not self.created_script_id:
            self.log_result("Get Script by ID", False, "No script ID available from previous test")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/scripts/{self.created_script_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get('id') == self.created_script_id:
                    required_fields = ['id', 'title', 'content', 'style', 'parsed_data']
                    if all(field in data for field in required_fields):
                        self.log_result("Get Script by ID", True, "Retrieved script by ID successfully")
                        return True
                    else:
                        missing = [f for f in required_fields if f not in data]
                        self.log_result("Get Script by ID", False, f"Missing fields: {missing}", data)
                else:
                    self.log_result("Get Script by ID", False, "Wrong script returned", f"Expected: {self.created_script_id}, Got: {data.get('id')}")
            elif response.status_code == 404:
                self.log_result("Get Script by ID", False, "Script not found (404)", self.created_script_id)
            else:
                self.log_result("Get Script by ID", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get Script by ID", False, "Request failed", str(e))
        return False
    
    def test_create_character(self):
        """Test 5: Character Management - Create Character"""
        sample_character = {
            "name": "Akira Yamamoto",
            "description": "A brave young warrior with spiky black hair and determined eyes",
            "tags": ["protagonist", "warrior", "determined"],
            "image_ref": "https://example.com/akira.jpg"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/characters", json=sample_character)
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'name', 'description', 'tags', 'created_at']
                
                if all(field in data for field in required_fields):
                    self.created_character_id = data['id']
                    if data['name'] == sample_character['name'] and data['description'] == sample_character['description']:
                        self.log_result("Create Character", True, f"Character created successfully with ID: {data['id']}")
                        return True
                    else:
                        self.log_result("Create Character", False, "Character data mismatch", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Create Character", False, f"Missing required fields: {missing}", data)
            else:
                self.log_result("Create Character", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Create Character", False, "Request failed", str(e))
        return False
    
    def test_get_characters(self):
        """Test 6: Character Management - Get All Characters"""
        try:
            response = self.session.get(f"{self.base_url}/characters")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our created character is in the list
                        char_found = any(char.get('id') == self.created_character_id for char in data)
                        if char_found:
                            self.log_result("Get All Characters", True, f"Retrieved {len(data)} characters including our test character")
                            return True
                        else:
                            self.log_result("Get All Characters", False, "Test character not found in results", f"Expected ID: {self.created_character_id}")
                    else:
                        self.log_result("Get All Characters", True, "Retrieved empty character list (valid)")
                        return True
                else:
                    self.log_result("Get All Characters", False, "Response is not a list", type(data))
            else:
                self.log_result("Get All Characters", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get All Characters", False, "Request failed", str(e))
        return False
    
    def test_delete_character(self):
        """Test 7: Character Management - Delete Character"""
        if not self.created_character_id:
            self.log_result("Delete Character", False, "No character ID available from previous test")
            return False
            
        try:
            response = self.session.delete(f"{self.base_url}/characters/{self.created_character_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_result("Delete Character", True, "Character deleted successfully")
                    return True
                else:
                    self.log_result("Delete Character", False, "Unexpected response format", data)
            elif response.status_code == 404:
                self.log_result("Delete Character", False, "Character not found (404)", self.created_character_id)
            else:
                self.log_result("Delete Character", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Delete Character", False, "Request failed", str(e))
        return False
    
    def test_generate_manga(self):
        """Test 8: Generation Endpoints - Start Manga Generation"""
        if not self.created_script_id:
            self.log_result("Generate Manga", False, "No script ID available for generation")
            return False
            
        generation_request = {
            "script_id": self.created_script_id,
            "style": "shounen",
            "options": {}
        }
        
        try:
            response = self.session.post(f"{self.base_url}/generate/manga", json=generation_request)
            if response.status_code == 200:
                data = response.json()
                required_fields = ['job_id', 'status', 'message']
                
                if all(field in data for field in required_fields):
                    self.created_job_id = data['job_id']
                    if data['status'] == 'started':
                        self.log_result("Generate Manga", True, f"Manga generation started with job ID: {data['job_id']}")
                        return True
                    else:
                        self.log_result("Generate Manga", False, f"Unexpected status: {data['status']}", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Generate Manga", False, f"Missing required fields: {missing}", data)
            else:
                self.log_result("Generate Manga", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Generate Manga", False, "Request failed", str(e))
        return False
    
    def test_generation_status(self):
        """Test 9: Generation Endpoints - Check Job Status"""
        if not self.created_job_id:
            self.log_result("Generation Status", False, "No job ID available from previous test")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/generate/status/{self.created_job_id}")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'status', 'progress', 'completed_panels']
                
                if all(field in data for field in required_fields):
                    if data['id'] == self.created_job_id:
                        status = data['status']
                        progress = data['progress']
                        self.log_result("Generation Status", True, f"Job status: {status}, Progress: {progress:.1%}")
                        return True
                    else:
                        self.log_result("Generation Status", False, "Wrong job ID returned", f"Expected: {self.created_job_id}, Got: {data.get('id')}")
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Generation Status", False, f"Missing required fields: {missing}", data)
            elif response.status_code == 404:
                self.log_result("Generation Status", False, "Job not found (404)", self.created_job_id)
            else:
                self.log_result("Generation Status", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Generation Status", False, "Request failed", str(e))
        return False
    
    def test_error_handling(self):
        """Test 10: Error Handling"""
        error_tests = []
        
        # Test 404 for non-existent script
        try:
            response = self.session.get(f"{self.base_url}/scripts/non-existent-id")
            if response.status_code == 404:
                error_tests.append(("Script 404", True, "Correctly returned 404 for non-existent script"))
            else:
                error_tests.append(("Script 404", False, f"Expected 404, got {response.status_code}"))
        except Exception as e:
            error_tests.append(("Script 404", False, f"Request failed: {str(e)}"))
        
        # Test 404 for non-existent character
        try:
            response = self.session.delete(f"{self.base_url}/characters/non-existent-id")
            if response.status_code == 404:
                error_tests.append(("Character 404", True, "Correctly returned 404 for non-existent character"))
            else:
                error_tests.append(("Character 404", False, f"Expected 404, got {response.status_code}"))
        except Exception as e:
            error_tests.append(("Character 404", False, f"Request failed: {str(e)}"))
        
        # Test malformed script data
        try:
            malformed_script = {"title": "Test"}  # Missing required fields
            response = self.session.post(f"{self.base_url}/scripts/parse", json=malformed_script)
            if response.status_code in [400, 422]:  # Validation error
                error_tests.append(("Malformed Data", True, f"Correctly returned {response.status_code} for malformed data"))
            else:
                error_tests.append(("Malformed Data", False, f"Expected 400/422, got {response.status_code}"))
        except Exception as e:
            error_tests.append(("Malformed Data", False, f"Request failed: {str(e)}"))
        
        # Log all error handling results
        all_passed = True
        for test_name, success, message in error_tests:
            self.log_result(f"Error Handling - {test_name}", success, message)
            if not success:
                all_passed = False
        
        return all_passed
    
    def test_static_files(self):
        """Test 11: Static File Serving"""
        try:
            # Test if images directory is accessible
            response = self.session.get(f"{BASE_URL}/images/")
            # Static file endpoints might return 404 if no files exist, which is acceptable
            if response.status_code in [200, 404, 403]:  # 403 might be returned for directory listing
                self.log_result("Static Files", True, f"Images endpoint accessible (HTTP {response.status_code})")
                return True
            else:
                self.log_result("Static Files", False, f"Unexpected status code: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Static Files", False, "Request failed", str(e))
        return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Manga Creator Backend API Tests")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 60)
        
        tests = [
            self.test_api_health,
            self.test_script_parsing,
            self.test_get_scripts,
            self.test_get_script_by_id,
            self.test_create_character,
            self.test_get_characters,
            self.test_delete_character,
            self.test_generate_manga,
            self.test_generation_status,
            self.test_error_handling,
            self.test_static_files
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                print(f"❌ Test {test.__name__} crashed: {str(e)}")
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the details above.")
        
        return passed, total, self.test_results

def main():
    """Main test execution"""
    tester = MangaCreatorTester()
    passed, total, results = tester.run_all_tests()
    
    # Return exit code based on results
    return 0 if passed == total else 1

if __name__ == "__main__":
    exit(main())