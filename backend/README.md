<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

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