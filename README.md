# FlixStore E-Commerce Platform

A cloud-native, microservices-based e-commerce application built for modern deployment on AWS EKS. The project combines a Next.js storefront with backend services, containerized infrastructure, Kubernetes manifests, and monitoring tools for production-ready delivery.

## Overview

FlixStore is designed as a scalable online shopping platform with:

- A customer-facing frontend built with Next.js
- Multiple backend services for authentication, catalog, cart, and payments
- Cloud-native deployment using Docker, Kubernetes, and Terraform
- Monitoring with Prometheus and Grafana
- Integration with AWS services including EKS, ECR, and S3 for product images
- CI/CD automation for building and deploying application resources

## Architecture

```text
+------------------+      +------------------+      +------------------+
| Frontend         | ---> | Auth Service     | ---> | MongoDB          |
| Next.js          |      | :5001            |      | Stateful Set     |
+------------------+      +------------------+      +------------------+
         |
         |      +------------------+      +------------------+
         +----> | Product Catalog  | ---> | MongoDB          |
                | :5002            |      | Stateful Set     |
                +------------------+      +------------------+

         |
         |      +------------------+      +------------------+
         +----> | Cart Service     | ---> | MongoDB          |
                | :5003            |      | Stateful Set     |
                +------------------+      +------------------+

         |
                +------------------+      +------------------+
                | Payment Service  | ---> | MongoDB          |
                | :5005            |      | Stateful Set     |
                +------------------+      +------------------+

Monitoring: Prometheus + Grafana
Storage: AWS S3 for product images
Platform: AWS EKS + Terraform + GitHub Actions
```

## Core Features

- User registration and authentication
- Product catalog browsing and search
- Shopping cart operations
- Payment service integration
- Image hosting via S3 and public access configuration
- Containerized service deployment
- Kubernetes-based orchestration
- Monitoring and alerting dashboard
- Automated deployment pipeline

## Project Structure

```text
.
├── .github/
├── frontend/
│   ├── app/
│   ├── public/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
├── services/
│   ├── auth-service/
│   ├── cart-service/
│   ├── payment-service/
│   └── product-catalog/
├── terraform/
├── k8s/
├── monitoring/
├── deploy.sh
├── package.json
├── README.md
├── sonar-project.properties
├── package-lock.json
└── .gitignore
```

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind-ready app structure (extendable)

### Backend Services
- Node.js-based microservices
- MongoDB persistence per service
- REST-style APIs for application interactions

### Infrastructure
- AWS EKS
- Docker
- Terraform
- Kubernetes manifests
- Amazon ECR
- Amazon S3

### Observability
- Prometheus
- Grafana
- Alertmanager
- Email alerts through Gmail app password integration

### CI/CD
- GitHub Actions
- Docker image build and push
- Deployment automation via shell scripts

## Microservices

| Service | Port | Description |
|---------|------|-------------|
| Auth Service | 5001 | User authentication and registration |
| Product Catalog | 5002 | Product listing and catalog management |
| Cart Service | 5003 | Shopping cart operations |
| Payment Service | 5005 | Payment processing workflow |
| Frontend | 3000 | Customer-facing application |

## Local Development

### Prerequisites

- Node.js 18+
- npm
- Docker
- Docker Compose
- AWS CLI (for deployment)

### Start the project locally

```bash
# Start supporting services

docker-compose up -d

# Install frontend dependencies
cd frontend
npm install
npm run dev
```

Open the app in your browser at:

```text
http://localhost:3000
```

## Deployment to AWS

### 1. Configure AWS credentials

```bash
aws configure
```

### 2. Deploy infrastructure

```bash
cd terraform
terraform init
terraform apply
```

### 3. Deploy application

```bash
cd ..
./deploy.sh
```

## Accessing the Application

After deployment, fetch the public ingress or load balancer URL:

```bash
kubectl get ingress -n flixstore
```

Or:

```bash
kubectl get svc -n flixstore | grep LoadBalancer
```

## Monitoring and Alerts

The project includes Prometheus, Grafana, and Alertmanager for observability and alert handling.

### Grafana access

```bash
kubectl get svc -n monitoring grafana -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Default credentials:

- Username: `admin`
- Password: `admin123`

### Email alerts

The deployment supports Gmail-based notifications for Prometheus Alertmanager and Grafana.

1. Enable 2-Step Verification on the Gmail account
2. Create an App Password
3. Store it in the Kubernetes secret named `grafana-smtp`

```bash
kubectl create secret generic grafana-smtp \
  --namespace monitoring \
  --from-literal=smtp-user="your-alert-email@gmail.com" \
  --from-literal=smtp-password="YOUR_GMAIL_APP_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## S3 Product Image Storage

Terraform creates an S3 bucket for product images. Example upload:

```bash
aws s3 cp ./image.jpg s3://flixstore-product-images-XXXXX/products/
```

## CI/CD Pipeline

The repository includes GitHub Actions-based automation for:

1. Test stage
2. Build and push Docker images to ECR
3. Deploy updates to EKS

## Required GitHub Secrets

For CI/CD, configure these secrets in the repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`

## Repository Summary

FlixStore demonstrates a full-stack, production-oriented microservices architecture with infrastructure automation, monitoring, and deployment workflows. It is suitable for learning cloud-native application design, Kubernetes orchestration, and automated delivery pipelines.

## License

This project is currently set to the ISC license in package metadata unless otherwise updated.

## Contributing

Contributions are welcome. Open an issue or submit a pull request with your proposed improvements.

## Project Status

This repository is active as a sample cloud-native application and is structured for extension with additional business features, security improvements, and advanced deployment automation.
