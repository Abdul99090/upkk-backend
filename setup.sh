#!/bin/bash

# PUKK Application Quick Start Script
# This script sets up the PUKK backend for development

set -e

echo "=========================================="
echo "PUKK Backend - Quick Start Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 14.x"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✓ npm version: $(npm --version)"
echo ""

# Check if PostgreSQL is available (optional)
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL is installed: $(psql --version)"
else
    echo "⚠️  PostgreSQL not found in PATH"
    echo "   You can still use Docker Compose instead"
fi

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Creating .env file from .env.example..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your configuration."
else
    echo "⚠️  .env file already exists. Skipping copy."
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your environment:"
echo "   Edit .env file with your database and API settings"
echo ""
echo "2. Choose your database setup method:"
echo ""
echo "   Option A: Using PostgreSQL locally"
echo "   - Install PostgreSQL: https://www.postgresql.org/download/"
echo "   - Create database: createdb upkk_db"
echo "   - Run migrations: npm run migrate"
echo "   - Seed data: npm run seed"
echo ""
echo "   Option B: Using Docker Compose"
echo "   - Install Docker: https://docs.docker.com/get-docker/"
echo "   - Run: docker-compose up -d"
echo "   - Then: docker-compose exec backend npm run seed"
echo ""
echo "3. Start development server:"
echo "   npm run dev"
echo ""
echo "4. API will be available at:"
echo "   http://localhost:5000/api"
echo ""
echo "5. Login credentials (after seeding):"
echo "   Admin: admin@pukk.com / admin123456"
echo "   Karyawan: karyawan@pukk.com / karyawan123456"
echo ""
echo "For more information, see:"
echo "   - README.md"
echo "   - DEPLOYMENT.md"
echo "   - API_DOCUMENTATION.md"
echo ""
