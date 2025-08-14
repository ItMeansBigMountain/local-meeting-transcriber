variable "project_name" { type = string }
variable "location"     { 
    type = string  
    default = "centralus"
 }
variable "resource_group_name" { type = string }
variable "sku" { 
    type = string 
    default = "B1"
 }
variable "uploads_path" { 
    type = string 
    default = "uploads"
 }
variable "jwt_key" { type = string }
variable "hf_token" {
    type = string 
    default = "" 
}
