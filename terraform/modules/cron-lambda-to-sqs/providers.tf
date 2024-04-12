terraform {
  required_version = ">= 1.3.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.43.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.4.2"
    }
  }
}
