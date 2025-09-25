#!/bin/bash

# Profile Test Script for ARMS Platform
# This script helps test the profile access functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
API_BASE_URL="http://localhost:8080/api"
TEST_EMAIL="admin@university.edu"
TEST_PASSWORD="admin123"

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    local url="${API_BASE_URL}${endpoint}"
    local headers="Content-Type: application/json"
    
    if [ -n "$token" ]; then
        headers="${headers}; Authorization: Bearer ${token}"
    fi
    
    print_status "Testing ${method} ${endpoint}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "$headers" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "$headers" -d "$data" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_success "HTTP $http_code - ${endpoint}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        print_error "HTTP $http_code - ${endpoint}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    fi
    echo
}

# Function to test profile access
test_profile_access() {
    print_status "=== Testing Profile Access ==="
    
    # Test 1: Login
    print_status "Attempting login..."
    login_data="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
    login_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$login_data" "${API_BASE_URL}/auth/login")
    
    if echo "$login_response" | jq -e '.accessToken' > /dev/null 2>&1; then
        token=$(echo "$login_response" | jq -r '.accessToken')
        user_id=$(echo "$login_response" | jq -r '.user.id')
        user_name=$(echo "$login_response" | jq -r '.user.name')
        
        print_success "Login successful"
        echo "User ID: $user_id"
        echo "User Name: $user_name"
        echo
        
        # Test 2: Get current user info
        test_endpoint "GET" "/auth/me" "" "$token"
        
        # Test 3: Get user profile by ID
        test_endpoint "GET" "/users/$user_id" "" "$token"
        
        # Test 4: Search users
        test_endpoint "GET" "/users/search?query=$user_name" "" "$token"
        
        # Test 5: Test with invalid user ID
        test_endpoint "GET" "/users/99999" "" "$token"
        
    else
        print_error "Login failed"
        echo "$login_response" | jq . 2>/dev/null || echo "$login_response"
        
        # Try to register a test user
        print_status "Attempting to register test user..."
        register_data="{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test123\"}"
        register_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$register_data" "${API_BASE_URL}/auth/register")
        
        if echo "$register_response" | jq -e '.accessToken' > /dev/null 2>&1; then
            token=$(echo "$register_response" | jq -r '.accessToken')
            user_id=$(echo "$register_response" | jq -r '.user.id')
            user_name=$(echo "$register_response" | jq -r '.user.name')
            
            print_success "Registration successful"
            echo "User ID: $user_id"
            echo "User Name: $user_name"
            echo
            
            # Test profile access for new user
            test_endpoint "GET" "/users/$user_id" "" "$token"
        else
            print_error "Registration failed"
            echo "$register_response" | jq . 2>/dev/null || echo "$register_response"
        fi
    fi
}

# Function to check backend status
check_backend() {
    print_status "=== Checking Backend Status ==="
    
    # Check if backend is running
    if curl -s -f "http://localhost:8080/actuator/health" > /dev/null; then
        print_success "Backend is running"
        curl -s "http://localhost:8080/actuator/health" | jq . 2>/dev/null || curl -s "http://localhost:8080/actuator/health"
    else
        print_error "Backend is not running or not accessible"
        print_status "Please start the backend with: cd backend && ./mvnw spring-boot:run"
    fi
    echo
}

# Function to provide debugging tips
debugging_tips() {
    print_status "=== Profile Access Debugging Tips ==="
    echo "1. Check if user ID is correct in the request"
    echo "2. Verify user exists in the database"
    echo "3. Check backend logs for any errors"
    echo "4. Ensure authentication token is valid"
    echo "5. Test with different user IDs"
    echo
    echo "Common issues:"
    echo "- User ID mismatch between frontend and backend"
    echo "- User not found in database"
    echo "- Authentication token expired"
    echo "- CORS issues with profile requests"
    echo
}

# Main execution
main() {
    echo "=========================================="
    echo "ARMS Platform Profile Access Test"
    echo "=========================================="
    echo
    
    check_backend
    test_profile_access
    debugging_tips
    
    print_status "Profile access test completed. Check the results above for any issues."
}

# Run main function
main "$@"
