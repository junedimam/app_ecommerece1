output "alb_dns_name" {
  description = "DNS name of the ALB for accessing the application"
  value       = "http://flixstore-cluster-${module.eks.cluster_id}.elb.${var.aws_region}.amazonaws.com"
}

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

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "application_url" {
  description = "Public URL to access the application"
  value       = "http://flixstore-cluster-${module.eks.cluster_id}.elb.${var.aws_region}.amazonaws.com"
}