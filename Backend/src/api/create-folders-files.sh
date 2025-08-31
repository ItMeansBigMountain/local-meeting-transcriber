#!/bin/bash

# Run this inside your Backend folder
mkdir -p Controllers DTOs Models Services

# Create Controllers
touch Controllers/AuthController.cs
touch Controllers/MeetingsController.cs

# Create DTOs
touch DTOs/AuthDtos.cs
touch DTOs/MeetingDtos.cs

# Create Models
touch Models/AppUser.cs
touch Models/Meeting.cs
touch Models/AppDbContext.cs

# Create Services
touch Services/TranscriptionService.cs
touch Services/SummaryService.cs

# Create root files
touch Program.cs
touch appsettings.json
touch appsettings.Development.json
touch Backend.csproj
