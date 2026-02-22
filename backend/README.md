📦 Getting Started
## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Docker & Docker Compose** (for containerized development)
- **PostgreSQL** >= 13 (if running locally)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vanessaNjoroge2/AI-Parking-Management-System.git
cd backend
```


### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create environment files:


Create a .env file in the root directory:
```
DATABASE_URL="postgresql://Parking:your_secure_password@localhost:5432/Parking"
JWT_SECRET="your_super_secret_key"
PORT=3000
```

## Database

### Option 2: Local PostgreSQL Installation

1. Download(https://www.postgresql.org/download/) and Install PostgreSQL locally

2. Create database (Open psql or pgAdmin and run:):
   ```sql
   CREATE DATABASE Parking;
   CREATE USER Parking WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE Parking TO Parking;
   ```

### 3. Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed

# View database in Prisma Studio
npx prisma studio
```

### Creating New Migrations

```bash
# After schema changes
npx prisma migrate dev --name describe_your_changes

# Example
npx prisma migrate dev --name add_booking_expiry
```
## 🚀 Running the Application

### Option 1: Local Development (npm)

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```
#### Creating a Feature Branch

```bash
# 1. Create and checkout feature branch
git checkout -b booking

# 2. Work on your changes
# ... make changes ...

# 3. Stage your changes
git add .

# 4. Run quality checks
npm run format:check && npm run lint

# 5. Commit with proper format
git commit -m "add patient registration endpoint"
```
#### Keeping Your Branch Updated

```bash
# 1. Fetch latest changes from remote
git fetch origin

# 2. Rebase your branch onto latest master
git rebase origin/main

# 3. If conflicts occur, resolve them and continue
git add .
git rebase --continue

# 4. Force push your rebased branch (since history changed)
git push --force-with-lease origin booking
```
#### Submitting Your Work

```bash
# 1. Ensure your branch is up to date
git fetch origin
git rebase origin/main

# 2. Push your branch
git push --force-with-lease origin booking

# 3. Create Pull Request
# 4. After PR approval, merge will be done via rebase
```