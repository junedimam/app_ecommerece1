#!/bin/bash
set -e

echo "============================================"
echo "  FlixStore E-Commerce Platform Deployment"
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Provisioning AWS Infrastructure with Terraform${NC}"
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
cd ..

echo -e "${YELLOW}Step 2: Configuring kubectl for EKS${NC}"
aws eks update-kubeconfig --region us-east-1 --name flixstore-cluster

echo -e "${YELLOW}Step 3: Deploying Kubernetes Resources${NC}"
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/

echo -e "${YELLOW}Step 4: Setting up Monitoring (Prometheus & Grafana)${NC}"
kubectl create namespace monitoring || true
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm upgrade --install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  -f monitoring/prometheus-values.yaml

helm upgrade --install grafana grafana/grafana \
  --namespace monitoring \
  -f monitoring/grafana-values.yaml

echo -e "${YELLOW}Step 5: Deploying Nginx Ingress Controller${NC}"
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/aws/deploy.yaml

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "To get the application URL, run:"
echo "  kubectl get ingress -n flixstore"
echo ""
echo "To get Grafana URL, run:"
echo "  kubectl get svc -n monitoring grafana -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'"
echo ""
echo "Grafana credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "S3 Bucket for images:"
echo "  Check terraform output: terraform output -state=terraform/terraform.tfstate s3_bucket_name"