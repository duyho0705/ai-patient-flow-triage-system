---
description: how to rebuild and restart the backend application
---
This workflow helps you quickly stop any process using port 8080 and restart the Spring Boot backend.

1. Stop any process on port 8080
// turbo
```powershell
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

2. Start the backend
// turbo
```powershell
.\mvnw.cmd spring-boot:run
```
