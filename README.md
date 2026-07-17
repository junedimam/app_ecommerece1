# FlixStore E-Commerce Platform 🛒

A cloud-native microservices e-commerce platform deployed on AWS EKS with CI/CD, monitoring, and S3 image storage.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│ Auth Service │────▶│   MongoDB    │
│  (Next.js)   │     │  (:5001)     │     │  (Stateful)  │
└──────┬──────┘     └──────────────┘     └──────────────┘
       │            ┌──────────────┐     
       ├───────────▶│Product Catalog│────▶  MongoDB
       │            │  (:5002)     │     
       │            └──────────────┘     
       │            ┌──────────────┐     
       ├───────────▶│ Cart Service │────▶  MongoDB
       │            │  (:5003)     │     
       │            └──────────────┘     
       │            ┌──────────────┐     
       └───────────▶│Payment Service│────▶ MongoDB
                    │  (:5005)     │     
                    └──────────────┘     

Monitoring: Prometheus & Grafana
Image Storage: AWS S3
```

## Microservices

| Service | Port | Description |
|---------|------|-------------|
| Auth Service | 5001 | User registration & login |
| Product Catalog | 5002 | Product listing & search |
| Cart Service | 5003 | Shopping cart management |
| Payment Service | 5005 | Payment processing |
| Frontend | 3000 | Next.js UI |

## Infrastructure (AWS)

- **EKS Cluster**: Kubernetes cluster with auto-scaling
- **ECR**: Docker image registry for all services
- **S3**: Public bucket for product images with CORS enabled
- **VPC**: Public & private subnets across 2 AZs
- **NAT Gateway**: For private subnet internet access

## CI/CD Pipeline (GitHub Actions)

1. **Test** - Run tests across all services
2. **Build & Push** - Build Docker images & push to ECR
3. **Deploy** - Deploy to EKS with rolling updates

## Monitoring

- **Prometheus**: Metrics collection & alerting
- **Grafana**: Dashboards with pre-configured panels
- Dashboards: Kubernetes Cluster, Pods, Node Exporter

## Quick Start

### Local Development
```bash
# Start all services locally
docker-compose up -d

# Install frontend dependencies
cd frontend && npm install && npm run dev
```

### Deploy to AWS
```bash
# 1. Configure AWS credentials
aws configure

# 2. Deploy infrastructure
cd terraform
terraform init
terraform apply

# 3. Deploy application
cd ..
./deploy.sh
```

## Accessing the Application

After deployment, get the public DNS:
```bash
kubectl get ingress -n flixstore
```

Or get the ALB URL:
```bash
kubectl get svc -n flixstore | grep LoadBalancer
```

## Grafana Dashboard

```bash
kubectl get svc -n monitoring grafana -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```
- Username: `admin`
- Password: `admin123`

## S3 Bucket for Images

The S3 bucket is created by Terraform. To upload images:
```bash
aws s3 cp ./image.jpg s3://flixstore-product-images-XXXXX/products/
```

## Required GitHub Secrets

For CI/CD pipeline, configure these secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`