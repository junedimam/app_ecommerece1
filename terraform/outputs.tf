output "s3_bucket_name" {
  description = "S3 bucket name for product images"
  value       = aws_s3_bucket.flixstore_images.bucket
}

output "s3_image_upload_url" {
  description = "S3 bucket URL for image uploads"
  value       = "https://${aws_s3_bucket.flixstore_images.bucket}.s3.${var.aws_region}.amazonaws.com"
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "application_url" {
  description = "Public URL to access the application (will be available after ingress is deployed)"
  value       = "The application URL will be available after deploying the ingress controller and checking: kubectl get ingress -n flixstore"
}
