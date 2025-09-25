#!/bin/bash

# Quick AWS Setup Script for ARMS Platform
# This script helps you get started with AWS deployment quickly

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

# Function to check AWS CLI installation
check_aws_cli() {
    print_status "Checking AWS CLI installation..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed."
        echo "Please install AWS CLI first:"
        echo "  macOS: brew install awscli"
        echo "  Linux: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install"
        echo "  Windows: Download from https://aws.amazon.com/cli/"
        exit 1
    fi
    
    print_success "AWS CLI is installed"
}

# Function to configure AWS CLI
configure_aws() {
    print_status "Configuring AWS CLI..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_warning "AWS CLI is not configured."
        echo "Please run 'aws configure' and enter your credentials:"
        echo "  AWS Access Key ID: [Your access key]"
        echo "  AWS Secret Access Key: [Your secret key]"
        echo "  Default region name: us-east-1"
        echo "  Default output format: json"
        echo
        read -p "Press Enter after configuring AWS CLI..."
    else
        print_success "AWS CLI is already configured"
    fi
}

# Function to create IAM user
create_iam_user() {
    print_status "Setting up IAM user..."
    
    USER_NAME="arms-platform-user"
    
    # Check if user already exists
    if aws iam get-user --user-name "$USER_NAME" &> /dev/null; then
        print_warning "IAM user $USER_NAME already exists"
        return
    fi
    
    # Create user
    aws iam create-user --user-name "$USER_NAME"
    
    # Create access key
    ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "$USER_NAME")
    ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
    SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')
    
    # Attach policies
    aws iam attach-user-policy --user-name "$USER_NAME" --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
    aws iam attach-user-policy --user-name "$USER_NAME" --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess
    aws iam attach-user-policy --user-name "$USER_NAME" --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
    aws iam attach-user-policy --user-name "$USER_NAME" --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess
    aws iam attach-user-policy --user-name "$USER_NAME" --policy-arn arn:aws:iam::aws:policy/Route53FullAccess
    
    print_success "IAM user created successfully"
    echo
    echo "=== IMPORTANT: Save these credentials securely ==="
    echo "Access Key ID: $ACCESS_KEY_ID"
    echo "Secret Access Key: $SECRET_ACCESS_KEY"
    echo "=================================================="
    echo
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ -f ".env" ]; then
        print_warning ".env file already exists. Backing up to .env.backup"
        cp .env .env.backup
    fi
    
    # Generate random passwords
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    cat > .env << EOF
# AWS Environment Configuration
ENVIRONMENT=development
AWS_DEFAULT_REGION=us-east-1

# AWS Credentials (replace with your actual credentials)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Database Configuration
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}

# Application Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://localhost:3000

# S3 Configuration (will be set during deployment)
AWS_S3_BUCKET_NAME=
CLOUDFRONT_DOMAIN=
EOF
    
    print_success "Environment file created"
    echo "Generated passwords:"
    echo "  Database Password: $DB_PASSWORD"
    echo "  JWT Secret: $JWT_SECRET"
}

# Function to install dependencies
install_dependencies() {
    print_status "Checking dependencies..."
    
    # Check for jq
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install jq
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update && sudo apt-get install -y jq
        else
            print_error "Please install jq manually: https://stedolan.github.io/jq/"
            exit 1
        fi
    fi
    
    # Check for PostgreSQL client
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client is not installed."
        echo "Please install PostgreSQL client:"
        echo "  macOS: brew install postgresql"
        echo "  Linux: sudo apt-get install postgresql-client"
        echo "  Windows: Download from https://www.postgresql.org/download/"
    fi
    
    print_success "Dependencies check completed"
}

# Function to display next steps
display_next_steps() {
    print_success "Quick setup completed!"
    echo
    echo "=== Next Steps ==="
    echo "1. Update .env file with your AWS credentials"
    echo "2. Run './deploy.sh development' to deploy to AWS"
    echo "3. Monitor the deployment progress"
    echo "4. Test your application once deployed"
    echo
    echo "=== Important Files ==="
    echo "- .env: Environment configuration"
    echo "- infrastructure.yml: AWS infrastructure template"
    echo "- deploy.sh: Deployment script"
    echo
    echo "=== Documentation ==="
    echo "- aws-setup-guide.md: Complete setup guide"
    echo "- README.md: Project documentation"
    echo
}

# Main execution
main() {
    echo "=========================================="
    echo "ARMS Platform AWS Quick Setup"
    echo "=========================================="
    echo
    
    check_aws_cli
    configure_aws
    install_dependencies
    create_iam_user
    create_env_file
    display_next_steps
}

# Run main function
main "$@"
