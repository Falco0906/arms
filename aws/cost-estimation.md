# AWS Cost Estimation for ARMS Platform

## Overview
This document provides detailed cost estimates for running the ARMS Platform on AWS across different environments and usage scenarios.

## Cost Breakdown by Service

### 1. Compute Services

#### EC2 Instances
| Instance Type | vCPUs | RAM | Hourly Cost | Monthly Cost (730h) |
|---------------|-------|-----|-------------|-------------------|
| t3.micro       | 2     | 1GB | $0.0104     | $7.59             |
| t3.small       | 2     | 2GB | $0.0208     | $15.18            |
| t3.medium      | 2     | 4GB | $0.0416     | $30.37            |
| t3.large       | 2     | 8GB | $0.0832     | $60.74            |

**Recommended:**
- Development: t3.micro ($7.59/month)
- Staging: t3.small ($15.18/month)
- Production: t3.medium ($30.37/month)

#### Auto Scaling
- Additional instances scale based on demand
- Cost scales linearly with instance count

### 2. Database Services

#### RDS PostgreSQL
| Instance Type | vCPUs | RAM | Storage | Hourly Cost | Monthly Cost |
|---------------|-------|-----|---------|-------------|--------------|
| db.t3.micro   | 2     | 1GB | 20GB    | $0.017      | $12.41       |
| db.t3.small   | 2     | 2GB | 20GB    | $0.034      | $24.82       |
| db.t3.medium  | 2     | 4GB | 20GB    | $0.068      | $49.64       |

**Additional Costs:**
- Storage: $0.115/GB/month (gp2)
- Backup Storage: $0.095/GB/month
- Multi-AZ: 2x instance cost

**Recommended:**
- Development: db.t3.micro ($12.41/month)
- Staging: db.t3.small ($24.82/month)
- Production: db.t3.medium + Multi-AZ ($99.28/month)

### 3. Storage Services

#### S3 Storage
| Storage Class | Cost per GB/Month | Use Case |
|---------------|------------------|----------|
| Standard      | $0.023           | Active files |
| Standard-IA   | $0.0125          | Infrequent access |
| Glacier       | $0.004           | Archive |

**Estimated Usage:**
- Course materials: 100GB/month
- Frontend assets: 1GB/month
- Backups: 50GB/month

**Monthly Cost:**
- Standard (100GB): $2.30
- Standard-IA (50GB): $0.625
- Glacier (50GB): $0.20
- **Total Storage: ~$3.13/month**

#### S3 Requests
| Request Type | Cost per 1,000 requests |
|--------------|-------------------------|
| PUT/POST     | $0.0004                 |
| GET          | $0.0004                 |
| DELETE       | $0.0004                 |

**Estimated Monthly Requests:**
- File uploads: 10,000 requests
- File downloads: 100,000 requests
- **Total Request Cost: ~$0.44/month**

### 4. Content Delivery Network (CDN)

#### CloudFront
| Data Transfer | Cost per GB |
|---------------|-------------|
| First 10TB   | $0.085      |
| Next 40TB    | $0.080      |
| Next 100TB   | $0.060      |

**Estimated Usage:**
- Frontend assets: 10GB/month
- File downloads: 100GB/month
- **Total CDN Cost: ~$9.35/month**

### 5. Networking

#### Data Transfer
| Transfer Type | Cost per GB |
|---------------|-------------|
| Out to Internet | $0.09      |
| Out to CloudFront | $0.00    |
| In from Internet | $0.00     |

**Estimated Monthly Transfer:**
- Application data: 50GB
- **Transfer Cost: ~$4.50/month**

### 6. Domain and SSL

#### Route 53
- Hosted Zone: $0.50/month
- DNS Queries: $0.40 per million queries
- **Estimated: ~$0.50/month**

#### SSL Certificate
- AWS Certificate Manager: Free
- **Cost: $0/month**

## Environment-Specific Cost Estimates

### Development Environment
| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EC2 (t3.micro) | 1 instance | $7.59 |
| RDS (db.t3.micro) | Single AZ | $12.41 |
| S3 Storage | 20GB | $0.46 |
| S3 Requests | 1K requests | $0.004 |
| CloudFront | 5GB transfer | $0.43 |
| Data Transfer | 10GB | $0.90 |
| Route 53 | Basic | $0.50 |
| **Total** | | **$22.30** |

### Staging Environment
| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EC2 (t3.small) | 1 instance | $15.18 |
| RDS (db.t3.small) | Single AZ | $24.82 |
| S3 Storage | 50GB | $1.15 |
| S3 Requests | 5K requests | $0.02 |
| CloudFront | 20GB transfer | $1.70 |
| Data Transfer | 25GB | $2.25 |
| Route 53 | Basic | $0.50 |
| **Total** | | **$45.62** |

### Production Environment
| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EC2 (t3.medium) | 2 instances | $60.74 |
| RDS (db.t3.medium) | Multi-AZ | $99.28 |
| S3 Storage | 200GB | $4.60 |
| S3 Requests | 50K requests | $0.20 |
| CloudFront | 200GB transfer | $17.00 |
| Data Transfer | 100GB | $9.00 |
| Route 53 | Basic | $0.50 |
| **Total** | | **$191.32** |

## Cost Optimization Strategies

### 1. Reserved Instances
- **EC2 Reserved Instances**: Up to 75% savings
- **RDS Reserved Instances**: Up to 69% savings
- **Commitment**: 1-3 years

### 2. Spot Instances
- **EC2 Spot Instances**: Up to 90% savings
- **Risk**: Can be terminated with 2-minute notice
- **Best for**: Non-critical workloads

### 3. S3 Lifecycle Policies
- **Automatic transitions**: Standard → IA → Glacier
- **Cost savings**: Up to 80% for archived data

### 4. CloudFront Caching
- **Cache static assets**: Reduce origin requests
- **Cost savings**: Reduced data transfer costs

### 5. Auto Scaling
- **Scale down during low usage**: Reduce costs
- **Scale up during peak**: Maintain performance

## Monitoring and Cost Management

### 1. AWS Cost Explorer
- **Track spending**: Real-time cost monitoring
- **Forecast costs**: Predict future spending
- **Cost allocation**: Tag-based cost tracking

### 2. AWS Budgets
- **Set spending limits**: Prevent cost overruns
- **Alerts**: Email/SMS notifications
- **Actions**: Automatic cost controls

### 3. AWS Trusted Advisor
- **Cost optimization**: Recommendations
- **Performance**: Optimization suggestions
- **Security**: Best practices

## Scaling Cost Estimates

### Small University (1,000 users)
- **Monthly Cost**: ~$200-300
- **Annual Cost**: ~$2,400-3,600

### Medium University (5,000 users)
- **Monthly Cost**: ~$500-800
- **Annual Cost**: ~$6,000-9,600

### Large University (20,000+ users)
- **Monthly Cost**: ~$1,500-3,000
- **Annual Cost**: ~$18,000-36,000

## Cost Comparison with Alternatives

### Traditional On-Premises
| Component | Annual Cost |
|-----------|-------------|
| Servers | $10,000-20,000 |
| Database | $5,000-10,000 |
| Storage | $2,000-5,000 |
| Maintenance | $5,000-10,000 |
| **Total** | **$22,000-45,000** |

### AWS Cloud
| Environment | Annual Cost |
|-------------|-------------|
| Production | $2,296 |
| Staging | $547 |
| Development | $268 |
| **Total** | **$3,111** |

**Savings**: 85-93% compared to on-premises

## Conclusion

AWS provides a cost-effective solution for the ARMS Platform with:
- **Low initial costs**: Start with development environment (~$22/month)
- **Scalable pricing**: Pay only for what you use
- **High availability**: Built-in redundancy and failover
- **Global reach**: CloudFront CDN for worldwide access
- **Managed services**: Reduced operational overhead

The total cost of ownership (TCO) is significantly lower than traditional on-premises solutions, making AWS an excellent choice for educational institutions.
