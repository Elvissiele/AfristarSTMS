#!/bin/bash
# Test Login with detailed output
echo "Testing Login for john@example.com..."
curl -v -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}' 2>&1

echo "\n\nTesting Login for elvis@example.com (incorrect execution check)..."
curl -v -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"elvis@example.com","password":"password123"}' 2>&1
