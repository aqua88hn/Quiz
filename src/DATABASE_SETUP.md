# PostgreSQL Setup Guide - Local Development

## Part 1: Install PostgreSQL Local

### Windows
1. Download: https://www.postgresql.org/download/windows/
2. Run installer (version 14+)
3. Default settings, remember password for `postgres` user
4. Verify: Open PowerShell
```powershell
psql -U postgres
```

## Part 2: Use PostgreSQL Docker Destop Local

```bash
docker run --name postgres-quiz \
  -e POSTGRES_USER=postgres-dba \
  -e POSTGRES_PASSWORD=p@ssWord123 \
  -e POSTGRES_DB=quizmate \
  -p 5432:5432 -d postgres:latest

# Init DB

```