terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC with Public and Private Subnets
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.8.1"

  name = "flixstore-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway     = true
  enable_vpn_gateway     = false
  single_nat_gateway     = true
  enable_dns_hostnames   = true
  enable_dns_support     = true

  tags = {
    Terraform   = "true"
    Environment = "production"
  }
}

# S3 Bucket for Product Images
resource "aws_s3_bucket" "flixstore_images" {
  bucket = "flixstore-product-images-${random_string.suffix.result}"
  
  tags = {
    Name        = "FlixStore Product Images"
    Environment = "production"
  }
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_public_access_block" "flixstore_images" {
  bucket = aws_s3_bucket.flixstore_images.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "flixstore_images" {
  bucket = aws_s3_bucket.flixstore_images.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.flixstore_images.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "flixstore_images" {
  bucket = aws_s3_bucket.flixstore_images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

resource "aws_s3_bucket_versioning" "flixstore_images" {
  bucket = aws_s3_bucket.flixstore_images.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ECR Repositories for all services
resource "aws_ecr_repository" "auth_service" {
  name                 = "flixstore-auth-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "product_catalog" {
  name                 = "flixstore-product-catalog"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "cart_service" {
  name                 = "flixstore-cart-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "payment_service" {
  name                 = "flixstore-payment-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "frontend" {
  name                 = "flixstore-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.20.0"

  cluster_name    = "flixstore-cluster"
  cluster_version = "1.32"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  # Self-managed node group
  eks_managed_node_groups = {
    flixstore_nodes = {
      desired_size = 1
      min_size     = 1
      max_size     = 1

      instance_types = ["t2.micro"]

      subnet_ids = module.vpc.private_subnets
    }
  }

  tags = {
    Environment = "production"
    Terraform   = "true"
  }
}

# Kubernetes Provider
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", var.aws_region]
  }
}

# Helm Provider
provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", var.aws_region]
    }
  }
}

# NGINX Ingress Controller - provisions an AWS Network Load Balancer
# with a public DNS name that fronts the whole application.
resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true
  version          = "4.11.3"

  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-type"
    value = "nlb"
  }

  depends_on = [module.eks]
}

# Prometheus - metrics collection for the cluster and the app services
resource "helm_release" "prometheus" {
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "prometheus"
  namespace        = "monitoring"
  create_namespace = true
  version          = "25.24.1"

  values = [file("${path.module}/../monitoring/prometheus-values.yaml")]

  depends_on = [module.eks]
}

# Grafana - dashboards on top of Prometheus, exposed via its own public LoadBalancer
resource "helm_release" "grafana" {
  name             = "grafana"
  repository       = "https://grafana.github.io/helm-charts"
  chart            = "grafana"
  namespace        = "monitoring"
  create_namespace = true
  version          = "8.6.4"

  values = [file("${path.module}/../monitoring/grafana-values.yaml")]

  depends_on = [module.eks, helm_release.prometheus]
}

# Outputs are defined in outputs.tf
