#!/bin/bash

# Valkey GLIDE Demo - Development Server
# Simple HTTP server for local testing

echo "Starting Valkey GLIDE Demo Frontend"
echo "======================================="
echo ""
echo "Opening demo at: http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""
echo "Note: Backend WebSocket server must be running on port 3000"
echo ""

# Check if Node.js is available
if command -v node &> /dev/null; then
    # Use Node.js http-server if available
    if command -v npx &> /dev/null; then
        echo "Using Node.js http-server..."
        npx http-server . -p 8080 -c-1 --cors
    else
        echo "Installing http-server globally..."
        npm install -g http-server
        http-server . -p 8080 -c-1 --cors
    fi
elif command -v python3 &> /dev/null; then
    # Fallback to Python 3 server
    echo "Using Python 3 HTTP server..."
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    # Fallback to Python 2 server
    echo "Using Python HTTP server..."
    python -m SimpleHTTPServer 8080
else
    echo "Error: No suitable HTTP server found"
    echo ""
    echo "Please install one of the following:"
    echo "- Node.js (recommended): https://nodejs.org/"
    echo "- Python 3: https://python.org/"
    echo ""
    echo "Alternatively, open index.html directly in your browser"
    exit 1
fi
