terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.120" }
  }
}
provider "azurerm" {  
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_service_plan" "plan" {
  name                = "${var.project_name}-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = var.sku
}

resource "azurerm_linux_web_app" "app" {
  name                = "${var.project_name}-api"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      dotnet_version = "8.0"
    }
  }

  app_settings = {
    "ASPNETCORE_ENVIRONMENT"     = "Production"
    "Jwt__Key"                   = var.jwt_key
    "Jwt__Issuer"                = "lmt"
    "Jwt__Audience"              = "lmt-audience"
    "Storage__UploadsPath"       = var.uploads_path
    "AI__HF_TOKEN"               = var.hf_token
    "Ollama__Model"              = "llama3"
  }

  https_only = true
}
