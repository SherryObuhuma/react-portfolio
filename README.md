# GitHub Actions CI/CD Pipeline to AWS ECR & EC2

An automated CI/CD pipeline that automatically builds Docker images, pushes them to AWS ECR, and deploys to EC2 instance using GitHub Actions all without hardcoded secrets or SSH keys.

### 🎯 What This Does

Every time you push code to GitHub:
* ✅ Automatically builds your app
* ✅ Packages it in a Docker container
* ✅ Stores it in AWS ECR
* ✅ Deploys to your EC2 Server
* ✅ Makes it live for users

Total time: 5 minutes (all automatic!)

### 📖 How It Works (Simple Explanation)

graph LR
    A[<b>1. Push Code</b><br/>10 seconds] --> B[<b>2. GitHub Builds It</b><br/>3-5 minutes]
    B --> C[<b>3. AWS Stores Container</b><br/>30 seconds]
    C --> D[<b>4. Your Server Runs It</b><br/>Live! ✨]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#dfd,stroke:#333,stroke-width:2px
    style D fill:#ffd,stroke:#333,stroke-width:2px

### ✨ Features
- 💰 FREE CI/CD - GitHub Actions
- ✅ Zero Secrets - Uses IAM roles.No access keys or SSH keys in code.
- ⚡ 50%+ Faster Builds - Docker layer caching with BuildKit
- 🏷️ Automatic Versioning -  YYYYMMDD-HHMMSS-BUILD-COMMIT format
- 🔄 Easy Rollbacks - One-click rollback to any previous version
- 🔒 Secure Deployment - AWS Systems Manager (no SSH required)
- 📦 Private Registry - ECR with automatic image scanning
- 🔄 Automated CI/CD - Push to main triggers automatic deployment
- 📊 Full Traceability - Track every deployment with version tags

## 🏗️ Architecture

### The Simple Version
                     **HOW IT ALL WORKS**

    YOU                GITHUB              AWS             USERS
     │                   │                  │                │
     │ git push          │                  │                │
     ├──────────────────>│                  │                │
     │                   │                  │                │
     │                   │ Build app        │                │
     │                   │ (3-5 min)        │                │
     │                   │                  │                │
     │                   │ Store it         │                │
     │                   ├─────────────────>│                │
     │                   │                  │                │
     │                   │ Deploy it        │                │
     │                   ├─────────────────>│                │
     │                   │                  │                │
     │                   │                  │ Visit site     │
     │                   │                  │<───────────────┤
     │                   │                  │                │
     │ ✅ Done!          │                  │ See changes! ✓ │
     │                   │                  │                │

### High Level Architecture

STEP 1: You Push Code
-----------------------
Developer --> git push --> GitHub Repository

STEP 2: GitHub Actions Builds
------------------------------
GitHub Repository --> webhook --> GitHub Actions
  |
  |-- Checkout code
  |-- Authenticate with AWS (OIDC - no keys!)
  |-- Build Docker image (3-5 min)
  |-- Push to ECR
  |-- Deploy to EC2 via SSM
  |-- Verify deployment
  |
  v
SUCCESS!

STEP 3: Deployment
------------------
GitHub Actions --> AWS ECR (stores image)
GitHub Actions --> EC2 Server (via SSM - no SSH!)

STEP 4: EC2 Runs Your App
--------------------------
EC2 pulls image from ECR
EC2 stops old container
EC2 starts new container
App is now live!

STEP 5: Users Access
--------------------
Users --> http://your-server.com --> EC2:80 --> Docker:3000 --> React App

Total Time: 3-5 minutes from push to live!

### Detailed Component Architecture

STEP 1: You Push Code
-----------------------
Developer --> git push --> GitHub Repository

STEP 2: GitHub Actions Builds
------------------------------
GitHub Repository --> webhook --> GitHub Actions
  |
  |-- Checkout code
  |-- Authenticate with AWS (OIDC - no keys!)
  |-- Build Docker image (3-5 min)
  |-- Push to ECR
  |-- Deploy to EC2 via SSM
  |-- Verify deployment
  |
  v
SUCCESS!

STEP 3: Deployment
------------------
GitHub Actions --> AWS ECR (stores image)
GitHub Actions --> EC2 Server (via SSM - no SSH!)

STEP 4: EC2 Runs Your App
--------------------------
EC2 pulls image from ECR
EC2 stops old container
EC2 starts new container
App is now live!

STEP 5: Users Access
--------------------
Users --> http://your-server.com --> EC2:80 --> Docker:3000 --> React App

Total Time: 3-5 minutes from push to live!

### Security Architecture
**OIDC Authentication Flow (No Access Keys!):**
1. GitHub Actions requests JWT token from GitHub
2. GitHub provides JWT token (valid 1 hour)
3. GitHub Actions sends JWT to AWS STS
4. AWS validates token with GitHub OIDC provider
5. AWS provides temporary credentials (expires in 1 hour)
6. GitHub Actions uses temp credentials to access AWS
7. Credentials auto-expire after 1 hour

Result: Zero access keys stored anywhere!

**IAM Roles:**
GitHubActionsDeployRole (attached via OIDC)
  - Permissions:
    * Push/pull images to/from ECR
    * Send SSM commands to EC2
    * Describe EC2 instances
  - Authentication: Temporary credentials only
  - Validity: 1 hour (auto-expires)
  - Trust: Only GitHub OIDC provider

AppEC2Role (attached to EC2 instance)
  - Permissions:
    * Pull images from ECR (read-only)
    * Receive SSM commands
    * Report status to SSM
  - Authentication: Instance profile
  - Trust: EC2 service

### Data Flow Infrastructure
**Complete Pipeline Flow**
Step 1: CODE COMMIT
  You --> git push --> GitHub

Step 2: BUILD TRIGGER  
  GitHub --> Webhook --> GitHub Actions (instant)

Step 3: BUILD (with caching)
  First Build:        3-5 minutes
  Cached Build:       1-3 minutes (50% faster!)

Step 4: TAGGING
  Creates 4 tags:
  - 20240207-143022-456-a1b2c3d (full version)
  - v1.456 (semantic)
  - latest (current)
  - buildcache (for speed)

Step 5: PUSH TO ECR
  GitHub Actions --> ECR (30 seconds)

Step 6: DEPLOY
  GitHub Actions --> SSM --> EC2
  Commands:
  1. ECR Login
  2. Pull new image
  3. Stop old container
  4. Start new container
  5. Save version
  6. Cleanup

Step 7: VERIFY
  Check: Container running? Version correct? Health OK?

Step 8: LIVE
  Users --> EC2:80 --> Docker:3000 --> React App

### Rollback Architecture

┌─────────────────────────────────────────────────────────────────────────┐
│                         ROLLBACK MECHANISM                               │
└─────────────────────────────────────────────────────────────────────────┘

Current State:
   App EC2 running: v1.456 (20240207-143022-456-a1b2c3d)

Available in ECR:
   ├─ v1.456 (20240207-143022-456-a1b2c3d)  ← Current
   ├─ v1.455 (20240207-120000-455-xyz1234)
   ├─ v1.454 (20240206-180000-454-abc5678)
   └─ ... (up to 15 versions)


Rollback Process:
   
STEP 1: Trigger Rollback
  - GitHub Actions workflow (manual trigger)
 
STEP 2: GitHub Actions Sends Command
  - Uses SSM to send commands to EC2
  - No SSH needed!

STEP 3: EC2 Executes Rollback
  1. Pull old version from ECR (v1.455)
  2. Stop current container
  3. Remove current container
  4. Start old version container
  5. Update version file
  6. Verify container is running

STEP 4: Verification
  - Check: Container running? YES
  - Check: Version correct? YES
  - Check: Health OK? YES

STEP 5: Complete!
  App now running v1.455 (30-60 seconds total)


**Rollback Guarantees:**
   + All versions stored for 15 builds
   + One command rollback
   + No code changes needed
   + Same deployment process (reliable)
   + Can rollback to ANY previous version

## 🚀 Quick Start
### Prerequisites
You need:
- AWS Account
- GitHub account
- Docker knowledge

### 1. Clone Repository
```
git clone https://SherryObuhuma/react-portfolio.git
cd github-actions-cicd-ecr-ec2
```

### 2. Setup AWS Infrastructure
* IAM role with OIDC (GitHub Actions + Application)
* ECR repository
* EC2 instance (Application)
* Security groups

### 3. Configure GitHub Secrets
1. Go to your repo → Settings → Secrets and variables → Actions
2. Click New repository secret
3. Add these 5 secrets:

### 🛠️ Required GitHub Secrets

| Secret Name | What to Put | Where to Get It |
| :--- | :--- | :--- |
| **`AWS_REGION`** | `us-east-1` | Your preferred AWS region |
| **`AWS_ROLE_ARN`** | `arn:aws:iam::123...` | From AWS IAM Role (OIDC) |
| **`ECR_REGISTRY`** | `123.dkr.ecr...` | From AWS ECR Console |
| **`ECR_REPOSITORY`** | `react-app` | Your ECR repository name |
| **`EC2_INSTANCE_ID`** | `i-0ab...` | From AWS EC2 Console |

### 4. Workflow Files Already Included
The repository includes:
The repository includes:
- [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) - Main deployment
- [`.github/workflows/rollback.yml`](./.github/workflows/rollback.yml) - Rollback workflow

### 5. Deploy
```
# Make a change and push
echo "# Test deployment" >> README.md
git add .
git commit -m "test: trigger deployment"
git push origin main

# GitHub Actions will detect and deploy automatically!
# Check progress at: github.com/yourrepo/actions
```

## ⚙️ How It Works
### Workflow Stages Explained
- stage('Checkout')------------# Clone repo, get git commit SHA
- stage('AWS Auth OIDC')-------# Get temporary credentials (no keys!)
- stage('ECR Login')-----------# Authenticate to ECR (IAM role)
- stage('Pull Cache')----------# Download previous build layers
- stage('Build Image')---------# Build with BuildKit caching
- stage('Push to ECR')---------# Upload with 4 different tags
- stage('Deploy via SSM')------# Remote deployment (no SSH)
- stage('Verify')--------------# Confirm container is running

### Version Tagging Strategy
Each build creates a version like:
```
20240207-143022-456-a1b2c3d
│        │      │   │
│        │      │   └─ Git commit (7 chars)
│        │      └───── GitHub run number
│        └──────────── Timestamp (HHmmss)
└───────────────────── Date (YYYYMMDD)
```

Why this format?
+ ✅ Chronologically sortable
+ ✅ Unique for every build
+ ✅ Easy to trace back to code
+ ✅ Human readable

### Docker Layer Caching
How it saves 50% time:

1. First build: Download everything

   - FROM node:18-alpine          ← Downloaded (100 MB)
   - COPY package.json            ← New layer
   - RUN npm install              ← Downloaded deps (200 MB)
   - COPY . .                     ← New layer
   - RUN npm build                ← Build (2 min)

2. Second build (no code changes):

   - FROM node:18-alpine          ← CACHED ✓ (0 sec)
   - COPY package.json            ← CACHED ✓ (0 sec)
   - RUN npm install              ← CACHED ✓ (0 sec)
   - COPY . .                     ← CACHED ✓ (0 sec)
   - RUN npm build                ← CACHED ✓ (0 sec)

3. Second build (code changed):

   - FROM node:18-alpine          ← CACHED ✓ (0 sec)
   - COPY package.json            ← CACHED ✓ (0 sec)
   - RUN npm install              ← CACHED ✓ (0 sec)
   - COPY . .                     ← REBUILD (new code)
   - RUN npm build                ← REBUILD (1 min)

## 🔄 Rollback
### List Available Versions
   ```
   ./scripts/list-versions.sh

# Output:
# Currently deployed: 20240207-143022-456-a1b2c3d
# 
# Available Versions:
# 20240207-143022-456-a1b2c3d  (Current)
# 20240207-120000-455-xyz1234
# 20240206-180000-454-abc5678
```

### Rollback to Previous Version
GitHub Actions Workflow:

1. Go to Actions tab
2. Click [`.github/workflows/rollback.yml`](./.github/workflows/rollback.yml)
3. Click Run workflow
4. Enter version: 20240207-120000-455-xyz1234
5. Click Run workflow

## 💰 Cost Analysis
### Cost Optimization Options

* Option 1: Spot Instances (Save 70%)
   App: t3.micro Spot = $2/mo
   (Total: ~$3.50/mo)

* Option 2: Smaller Instances
   App: t3.nano = $4/mo
   (Total: ~$5/mo)

* Option 3: Stop when not in use
   Only run during work hours (8h/day, 5 days/week)
   (Total: ~$2/mo)

* GitHub Actions Free Tier
   - 2,000 minutes/month (public repos)
   - 500 MB storage
   - Unlimited for public repos
   - Typical build: ~3-5 minutes

## 🙏 Acknowledgments

- GitHub for free, powerful CI/CD
- AWS for comprehensive documentation
- Docker for containerization
- Everyone who contributed to making this project better