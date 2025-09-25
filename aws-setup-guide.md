# AWS Setup Guide for ARMS Platform

## Overview
This guide will help you deploy your ARMS Platform to AWS with the following architecture:
- **Frontend**: React app deployed to S3 + CloudFront
- **Backend**: Spring Boot app on EC2/ECS
- **Database**: PostgreSQL on RDS
- **File Storage**: S3 for course materials
- **CDN**: CloudFront for global content delivery

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Domain name (optional, but recommended)

## Step 1: AWS Account Setup

### 1.1 Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/)
2. Create a new account or sign in
3. Complete account verification

### 1.2 Configure AWS CLI
```bash
# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter your Access Key ID, Secret Access Key, Region (e.g., us-east-1), and output format (json)
```

### 1.3 Create IAM User
1. Go to IAM Console → Users → Create User
2. Create user with programmatic access
3. Attach policies:
   - `AmazonS3FullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonEC2FullAccess`
   - `CloudFrontFullAccess`
   - `Route53FullAccess`
   - `IAMFullAccess`

## Step 2: S3 Bucket Setup

### 2.1 Create S3 Bucket
```bash
# Create bucket for file storage
aws s3 mb s3://arms-platform-files-$(date +%s) --region us-east-1

# Create bucket for frontend hosting
aws s3 mb s3://arms-platform-frontend-$(date +%s) --region us-east-1
```

### 2.2 Configure Bucket Policies
- Enable CORS for frontend bucket
- Set up lifecycle policies for file storage
- Configure public read access for frontend assets

## Step 3: RDS Database Setup

### 3.1 Create RDS Instance
```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
    --db-instance-identifier arms-platform-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username postgres \
    --master-user-password YOUR_SECURE_PASSWORD \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name arms-platform-subnet-group \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted
```

### 3.2 Configure Security Groups
- Allow inbound connections on port 5432 from your application servers
- Restrict access to specific IP ranges

## Step 4: Application Deployment

### 4.1 Backend Deployment (EC2)
1. Launch EC2 instance (t3.small recommended)
2. Install Java 17, Maven, and PostgreSQL client
3. Deploy your Spring Boot application
4. Configure environment variables

### 4.2 Frontend Deployment (S3 + CloudFront)
1. Build React application
2. Upload to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain (optional)

## Step 5: Environment Configuration

### 5.1 Backend Environment Variables
```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://arms-platform-db.xxxxx.us-east-1.rds.amazonaws.com:5432/arms_platform
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=YOUR_SECURE_PASSWORD

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=arms-platform-files-xxxxx

# JWT
JWT_SECRET=your_64_character_random_string

# CORS
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 5.2 Frontend Environment Variables
```bash
# API Endpoint
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_S3_BUCKET_URL=https://your-cloudfront-domain.cloudfront.net
```

## Step 6: Security Configuration

### 6.1 SSL/TLS Certificates
- Use AWS Certificate Manager for SSL certificates
- Configure HTTPS redirects
- Enable HSTS headers

### 6.2 Security Headers
- Configure CloudFront security headers
- Set up WAF rules for protection
- Enable AWS Shield for DDoS protection

## Step 7: Monitoring and Logging

### 7.1 CloudWatch
- Set up CloudWatch logs for application monitoring
- Configure alarms for critical metrics
- Set up log aggregation

### 7.2 Application Monitoring
- Configure health checks
- Set up performance monitoring
- Monitor database performance

## Step 8: Backup and Disaster Recovery

### 8.1 Database Backups
- Enable automated RDS backups
- Set up cross-region backup replication
- Test restore procedures

### 8.2 Application Backups
- Backup application code to S3
- Set up infrastructure as code
- Document recovery procedures

## Cost Optimization

### Estimated Monthly Costs (US East 1)
- **RDS PostgreSQL (db.t3.micro)**: ~$15-20/month
- **EC2 (t3.small)**: ~$15-20/month
- **S3 Storage (100GB)**: ~$2-3/month
- **CloudFront (1TB transfer)**: ~$85/month
- **Route 53**: ~$0.50/month
- **Total**: ~$120-130/month

### Cost Optimization Tips
- Use Reserved Instances for predictable workloads
- Enable S3 Intelligent Tiering
- Configure CloudFront caching policies
- Monitor usage with AWS Cost Explorer

## Next Steps

1. **Complete the setup**: Follow each step in order
2. **Test thoroughly**: Verify all functionality works
3. **Monitor performance**: Set up monitoring and alerts
4. **Scale as needed**: Adjust resources based on usage
5. **Security audit**: Regular security reviews and updates

## Support and Troubleshooting

- Check AWS CloudWatch logs for application issues
- Use AWS Support for infrastructure problems
- Monitor AWS Service Health Dashboard
- Set up AWS Personal Health Dashboard

---

**Note**: This is a production-ready setup. For development/testing, you can use smaller instance sizes and fewer services to reduce costs.
