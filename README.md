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
       ├───────────��│ Cart Service │────▶  MongoDB
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

- **Prometheus**: Metrics collection and alert rule evaluation
- **Prometheus Alertmanager**: Routes Prometheus alerts to Gmail
- **Grafana**: Dashboards and Grafana-managed alert notifications
- Dashboards: Kubernetes Cluster, Pods, Node Exporter

## Prometheus and Grafana Gmail Alerts

This project supports Gmail notifications for both Prometheus Alertmanager and Grafana. The deployment reads the SMTP credentials from the Kubernetes secret `grafana-smtp`; credentials are never committed to this repository.

### Gmail requirements

1. Enable 2-Step Verification on the Gmail account used for notifications.
2. Create a Gmail **App Password** for this deployment.
3. Do not use the normal Gmail account password and do not add the app password to Git.

### Configure and deploy email alerts

Run the deployment script and enter the Gmail address and app password when prompted:

```bash
./deploy.sh
```

The script creates or updates the secret in the `monitoring` namespace:

```bash
kubectl create secret generic grafana-smtp \
  --namespace monitoring \
  --from-literal=smtp-user="your-alert-email@gmail.com" \
  --from-literal=smtp-password="YOUR_GMAIL_APP_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -
```

Prometheus Alertmanager uses `smtp.gmail.com:587` and sends messages to the configured recipient. Grafana uses the same secret for its email contact point. The alert rules and notification policy are defined in:

- `monitoring/prometheus-values.yaml`
- `monitoring/grafana-values.yaml`
- `monitoring/grafana-alerting.yaml`

### Alert email examples

**Critical alert — Prometheus Alertmanager**

```text
Subject: [CRITICAL] FlixStore pod is crash looping

FlixStore monitoring detected a critical alert.
Alert: FlixStorePodCrashLooping
Severity: critical
Namespace: flixstore
Pod: <pod-name>
Container: <container-name>
Description: The container is in CrashLoopBackOff.
Status: firing
```

**Warning alert — Grafana**

```text
Subject: [WARNING] FlixStore pod is not ready

Grafana detected a warning condition in the FlixStore Kubernetes namespace.
Alert: FlixStorePodNotReady
Severity: warning
Namespace: flixstore
Pod: <pod-name>
Description: The pod has not been ready for 10 minutes.
Status: firing

Check the Grafana dashboard and Kubernetes pod logs for details.
```

Alerts are grouped by `alertname` and `namespace`, wait 30 seconds before the first notification, repeat every 4 hours, and send a resolved notification when the condition clears. The configured rules include unavailable deployment replicas, pods not ready, CrashLoopBackOff, repeated container restarts, and unavailable deployments.

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
