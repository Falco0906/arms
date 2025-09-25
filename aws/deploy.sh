#!/bin/bash

# AWS Deployment Script for ARMS Platform
# This script automates the deployment of the ARMS Platform to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
REGION=${AWS_DEFAULT_REGION:-us-east-1}
STACK_NAME="arms-platform-${ENVIRONMENT}"
TEMPLATE_FILE="infrastructure.yml"

# Function to print colored output
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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if template file exists
    if [ ! -f "$TEMPLATE_FILE" ]; then
        print_error "Template file $TEMPLATE_FILE not found."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to generate random passwords
generate_passwords() {
    print_status "Generating secure passwords..."
    
    # Generate database password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    print_success "Passwords generated"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure..."
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null; then
        print_warning "Stack $STACK_NAME already exists. Updating..."
        OPERATION="update-stack"
    else
        print_status "Creating new stack $STACK_NAME..."
        OPERATION="create-stack"
    fi
    
    # Deploy CloudFormation stack
    aws cloudformation $OPERATION \
        --stack-name "$STACK_NAME" \
        --template-body file://"$TEMPLATE_FILE" \
        --parameters \
            ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            ParameterKey=DatabasePassword,ParameterValue="$DB_PASSWORD" \
            ParameterKey=JWTSecret,ParameterValue="$JWT_SECRET" \
        --capabilities CAPABILITY_IAM \
        --region "$REGION"
    
    # Wait for stack to complete
    print_status "Waiting for stack operation to complete..."
    aws cloudformation wait stack-${OPERATION%-stack}-complete \
        --stack-name "$STACK_NAME" \
        --region "$REGION"
    
    print_success "Infrastructure deployment completed"
}

# Function to get stack outputs
get_outputs() {
    print_status "Retrieving stack outputs..."
    
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs' \
        --output table)
    
    echo "$OUTPUTS"
}

# Function to build and deploy backend
deploy_backend() {
    print_status "Building backend application..."
    
    # Navigate to backend directory
    cd ../backend
    
    # Build the application
    ./mvnw clean package -DskipTests
    
    # Get stack outputs for configuration
    DB_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
        --output text)
    
    S3_BUCKET=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`FileStorageBucketName`].OutputValue' \
        --output text)
    
    # Create environment configuration
    cat > .env << EOF
SPRING_DATASOURCE_URL=jdbc:postgresql://${DB_ENDPOINT}:5432/arms_platform
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
AWS_S3_BUCKET_NAME=${S3_BUCKET}
JWT_SECRET=${JWT_SECRET}
CORS_ALLOWED_ORIGINS=https://*.amazonaws.com,https://*.cloudfront.net
EOF
    
    print_success "Backend configuration created"
    
    # Upload JAR to S3 for deployment
    aws s3 cp target/platform-0.0.1-SNAPSHOT.jar s3://${S3_BUCKET}/deployments/
    
    print_success "Backend JAR uploaded to S3"
    
    cd ../aws
}

# Function to build and deploy frontend
deploy_frontend() {
    print_status "Building frontend application..."
    
    # Navigate to frontend directory
    cd ../frontend
    
    # Install dependencies
    npm install
    
    # Get CloudFront domain for API configuration
    CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
        --output text)
    
    # Create environment configuration
    cat > .env << EOF
REACT_APP_API_URL=https://${CLOUDFRONT_DOMAIN}/api
REACT_APP_S3_BUCKET_URL=https://${CLOUDFRONT_DOMAIN}/files
EOF
    
    # Build the application
    npm run build
    
    # Get frontend bucket name
    FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
        --output text)
    
    # Upload to S3
    aws s3 sync build/ s3://${FRONTEND_BUCKET}/ --delete
    
    # Invalidate CloudFront cache
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
        --output text)
    
    if [ "$DISTRIBUTION_ID" != "None" ] && [ "$DISTRIBUTION_ID" != "" ]; then
        aws cloudfront create-invalidation \
            --distribution-id "$DISTRIBUTION_ID" \
            --paths "/*"
    fi
    
    print_success "Frontend deployed to S3 and CloudFront"
    
    cd ../aws
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Get database endpoint
    DB_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
        --output text)
    
    # Wait for database to be available
    print_status "Waiting for database to be available..."
    aws rds wait db-instance-available \
        --db-instance-identifier "${STACK_NAME}-db" \
        --region "$REGION"
    
    # Run database initialization
    print_status "Initializing database..."
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_ENDPOINT" \
        -U postgres \
        -d arms_platform \
        -f ../../create-tables.sql
    
    print_success "Database setup completed"
}

# Function to display deployment information
display_info() {
    print_success "Deployment completed successfully!"
    echo
    echo "=== Deployment Information ==="
    echo "Environment: $ENVIRONMENT"
    echo "Region: $REGION"
    echo "Stack Name: $STACK_NAME"
    echo
    
    # Get and display outputs
    get_outputs
    
    echo
    echo "=== Next Steps ==="
    echo "1. Update your DNS to point to the CloudFront distribution"
    echo "2. Configure SSL certificate if using custom domain"
    echo "3. Set up monitoring and alerts"
    echo "4. Test all functionality"
    echo
    echo "=== Important Information ==="
    echo "Database Password: $DB_PASSWORD"
    echo "JWT Secret: $JWT_SECRET"
    echo "Save these credentials securely!"
}

# Main execution
main() {
    echo "=========================================="
    echo "ARMS Platform AWS Deployment Script"
    echo "=========================================="
    echo
    
    check_prerequisites
    generate_passwords
    deploy_infrastructure
    setup_database
    deploy_backend
    deploy_frontend
    display_info
}

# Run main function
main "$@"
