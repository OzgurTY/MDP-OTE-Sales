#!/bin/bash
set -e

echo "🚀 Starting Unified Build Process..."

# 1. Build Frontend
echo "📦 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Prepare Backend Static Resources
echo "📂 Moving Frontend build to Backend..."
TARGET_DIR="backend/src/main/resources/static"
mkdir -p "$TARGET_DIR"
rm -rf "$TARGET_DIR"/*
cp -r frontend/dist/* "$TARGET_DIR"/

# 3. Build Backend
echo "☕ Building Backend JAR..."
cd backend
./mvnw clean package -DskipTests
cd ..

echo "✅ Build Complete! Unified JAR is at: backend/target/sales-commission-system-0.0.1-SNAPSHOT.jar"
