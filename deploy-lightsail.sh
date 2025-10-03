#!/bin/bash

# MochaBot AWS Lightsail Deployment Script

echo "Deploying MochaBot to AWS Lightsail..."

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build the backend
echo "Building backend..."
cd backend
npm install
npm run build
cd ..

# Create Lightsail instance (if not exists)
echo "Setting up Lightsail instance..."
aws lightsail create-instances \
    --instance-names mochabot-backend \
    --availability-zone ap-south-1a \
    --blueprint-id nodejs_18 \
    --bundle-id nano_2_0

# Wait for instance to be running
echo "Waiting for instance to be ready..."
aws lightsail wait instance-running --instance-name mochabot-backend

# Get static IP
echo "Assigning static IP..."
aws lightsail allocate-static-ip --static-ip-name mochabot-ip
aws lightsail attach-static-ip --static-ip-name mochabot-ip --instance-name mochabot-backend

echo "Deployment complete!"
echo "Your MochaBot backend is now running on AWS Lightsail"
echo "Static IP assigned to your instance"
