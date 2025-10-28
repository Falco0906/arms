#!/bin/bash
# Build script for Render deployment

echo "Installing dependencies..."
npm install

echo "Building React app..."
npm run build

echo "Creating _redirects file for React Router..."
echo "/*    /index.html   200" > build/_redirects

echo "Build complete!"
