# Environment Configuration Guide

This document outlines all environment variables and configuration options for the ARMS Platform.

## Required Environment Variables

### Authentication & Security
- `JWT_SECRET`: Secret key for JWT token signing (required for production)
- `AUTH_ALLOWED_DOMAINS`: Comma-separated list of allowed email domains (default: klh.edu.in)
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins (default: http://localhost:3000)

### Firebase Configuration
- `FIREBASE_PROJECT_ID`: Firebase project ID (default: arms-8a8b8)
- `FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket name (default: arms-8a8b8.appspot.com)
- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to Firebase service account JSON file (default: firebase-service-account.json)
- `FIREBASE_STORAGE_ENABLED`: Enable Firebase Storage (default: false)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to Google Cloud credentials file (alternative to service account)

### AWS Configuration (Optional)
- `AWS_ENABLED`: Enable AWS services (default: false)
- `AWS_S3_ENABLED`: Enable AWS S3 storage (default: false)
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_S3_BUCKET_NAME`: S3 bucket name for file storage

### OAuth Configuration
- `GOOGLE_CLIENT_ID`: Google OAuth client ID for authentication

### File Upload Configuration
- `UPLOAD_DIR`: Local directory for file uploads (default: uploads)
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 50MB)

## Development vs Production

### Development Environment
For local development, you can use the default values in `application.properties`. 
Make sure to:
1. Set up Firebase project and download service account JSON
2. Configure Google OAuth if using Google login
3. Set up local file storage directory

### Production Environment
For production deployment, you MUST set:
1. `JWT_SECRET` to a secure random string
2. `AUTH_ALLOWED_DOMAINS` to your organization's domains
3. `CORS_ALLOWED_ORIGINS` to your frontend domain(s)
4. All Firebase/AWS credentials as needed
5. `UPLOAD_DIR` to an absolute path

## Security Considerations

1. **Never commit secrets to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate JWT secrets regularly**
4. **Use HTTPS in production**
5. **Restrict CORS origins to known domains**
6. **Use least-privilege IAM roles for AWS**

## Example Environment Files

### .env.development
```
JWT_SECRET=dev-secret-key-change-in-production
AUTH_ALLOWED_DOMAINS=klh.edu.in,example.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
FIREBASE_PROJECT_ID=arms-dev-project
FIREBASE_STORAGE_BUCKET=arms-dev-project.appspot.com
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account-dev.json
UPLOAD_DIR=/tmp/arms-uploads
```

### .env.production
```
JWT_SECRET=your-super-secure-jwt-secret-here
AUTH_ALLOWED_DOMAINS=yourdomain.edu
CORS_ALLOWED_ORIGINS=https://yourdomain.edu,https://app.yourdomain.edu
FIREBASE_PROJECT_ID=arms-prod-project
FIREBASE_STORAGE_BUCKET=arms-prod-project.appspot.com
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account-prod.json
FIREBASE_STORAGE_ENABLED=true
UPLOAD_DIR=/var/lib/arms-platform/uploads
```

## Docker Configuration

When using Docker, pass environment variables using:
```bash
docker run -e JWT_SECRET=your-secret -e FIREBASE_PROJECT_ID=your-project ...
```

Or use a `.env` file:
```bash
docker run --env-file .env.production ...
```

## Kubernetes Configuration

Use Kubernetes secrets for sensitive data:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: arms-platform-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  firebase-service-account: <base64-encoded-json>
```

## Troubleshooting

### Common Issues
1. **Firebase initialization fails**: Check `GOOGLE_APPLICATION_CREDENTIALS` or service account path
2. **CORS errors**: Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
3. **File upload fails**: Check `UPLOAD_DIR` permissions and disk space
4. **Authentication fails**: Verify `JWT_SECRET` is set and `AUTH_ALLOWED_DOMAINS` includes your domain

### Validation
Use the `/api/auth/test` endpoint to verify authentication configuration.
