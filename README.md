# GitHub Actions CI/CD Pipeline to AWS ECR & EC2

An automated CI/CD pipeline that automatically builds Docker images, pushes them to AWS ECR, and deploys to EC2 instance using GitHub Actions all without hardcoded secrets or SSH keys.

🎯 **What This Does**

Every time you push code to GitHub:
✅ Automatically builds your app
✅ Packages it in a Docker container
✅ Stores it in AWS ECR
✅ Deploys to your EC2 Server
✅ Makes it live for users

Total time: 5 minutes (all automatic!)

📖 **How It Works (Simple Explanation)**
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│  You Push   │  →   │   GitHub     │  →   │  AWS Stores │  →   │  Your Server │
│   Code      │      │   Builds It  │      │  Container  │      │  Runs It     │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
   10 seconds           3-5 minutes           30 seconds            Live! ✨

✨ **Features**
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

┌─────────────────────────────────────────────────────────┐
│                   HOW IT ALL WORKS                      │
└─────────────────────────────────────────────────────────┘

    YOU                GITHUB              AWS             USERS
     │                   │                  │                │
     │ git push          │                  │                │
     ├──────────────────▶│                  │                │
     │                   │                  │                │
     │                   │ Build app        │                │
     │                   │ (3-5 min)        │                │
     │                   │                  │                │
     │                   │ Store it         │                │
     │                   ├─────────────────▶│                │
     │                   │                  │                │
     │                   │ Deploy it        │                │
     │                   ├─────────────────▶│                │
     │                   │                  │                │
     │                   │                  │ Visit site     │
     │                   │                  │◀───────────────┤
     │                   │                  │                │
     │ ✅ Done!          │                  │ See changes! ✓ │
     │                   │                  │                │


### High Level Architecture

┌─────────────────────────────────────────────────────────────────────────┐
│                           CI/CD PIPELINE FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

    Developer            GitHub              GitHub Actions      AWS ECR          EC2 App Server    Users
    ─────────            ──────              ──────────────      ───────          ──────────────    ─────
        │                   │                      │                │                   │             │
        │  1. git push      │                      │                │                   │             │
        ├──────────────────▶│                      │                │                   │             │
        │                   │                      │                │                   │             │
        │                   │  2. Webhook          │                │                   │             │
        │                   │     (instant)        │                │                   │             │
        │                   ├─────────────────────▶│                │                   │             │
        │                   │                      │                │                   │             │
        │                   │                      │  3. Build      │                   │             │
        │                   │                      │     Docker     │                   │             │
        │                   │                      │     (~3 min)   │                   │             │
        │                   │                      │                │                   │             │
        │                   │                      │  4. Push       │                   │             │
        │                   │                      │     Image      │                   │             │
        │                   │                      ├───────────────▶│                   │             │
        │                   │                      │                │                   │             │
        │                   │                      │  5. Deploy!    │                   │             │
        │                   │                      ├───────────────────────────────────▶│             │
        │                   │                      │                │                   │             │
        │                   │                      │                │  6. Pull Image    │             │
        │                   │                      │                │◀──────────────────┤             │
        │                   │                      │                │                   │             │
        │                   │                      │                │  7. Run Container │             │
        │                   │                      │                │                   │             │
        │                   │                      │  8. Verify ✓   │                   │             │
        │                   │                      │◀───────────────────────────────────┤             │
        │                   │                      │                │                   │             │
        │  9. ✅ Done!      │                      │                │                   │  10. Visit  │
        │◀──────────────────┤                      │                │                   │     Site    │
        │                   │                      │                │                   │◀────────────┤
        │                   │                      │                │                   │             │

### Detailed Component Architecture

┌──────────────────────────┐
│     GitHub Repository     │
│  ┌─────────────────────┐ │
│  │  .github/workflows/ │ │
│  │  ├─ deploy.yml      │ │  ← Main deployment workflow
│  │  └─ rollback.yml    │ │  ← Rollback workflow
│  │   Dockerfile        │ │
│  │   Source Code       │ │
│  └─────────────────────┘ │
└────────────┬─────────────┘
             │ Push Event
             ▼
┌────────────────────────────────────────────────────────┐
│         GitHub Actions (FREE!)                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Runner: ubuntu-latest (GitHub's servers)        │ │
│  │  IAM Role: GitHubActionsDeployRole (OIDC)       │ │
│  │  • No access keys! 🔐                           │ │
│  │  • Temporary credentials (1 hour)               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Pipeline Stages:                                │ │
│  │  1. Checkout Code                                │ │
│  │  2. AWS Auth (OIDC - no keys!)                  │ │
│  │  3. ECR Login                                    │ │
│  │  4. Build Docker Image (BuildKit + cache)       │ │
│  │  5. Push to ECR                                  │ │
│  │  6. Deploy via SSM (no SSH!)                    │ │
│  │  7. Verify Deployment                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  Cost: FREE (2,000 minutes/month) 🎉                   │
└────────────┬───────────────────────┬───────────────────┘
             │                       │
             │ Push Image            │ SSM Command
             │                       │
             ▼                       ▼
┌─────────────────────────┐   ┌──────────────────────────────────┐
│      AWS ECR             │   │    Application EC2 Instance       │
│  ┌────────────────────┐ │   │  ┌────────────────────────────┐  │
│  │  Repository:        │ │   │  │  IAM Role: AppEC2Role      │  │
│  │  react-app          │ │   │  │  • ECRReadOnly             │  │
│  │                     │ │   │  │  • SSMManagedInstanceCore  │  │
│  │  Images:            │ │   │  └────────────────────────────┘  │
│  │  • v1.123           │ │   │                                   │
│  │  • 20240207-...     │ │   │  ┌────────────────────────────┐  │
│  │  • latest           │ │   │  │  Docker Container           │  │
│  │  • buildcache       │ │   │  │  ┌──────────────────────┐  │  │
│  │                     │ │   │  │  │  React Application   │  │  │
│  │  Lifecycle Policy:  │ │   │  │  │  Port: 3000          │  │  │
│  │  Keep last 15       │ │   │  │  └──────────────────────┘  │  │
│  │                     │ │   │  │                             │  │
│  │  Image Scanning:    │ │   │  │  Mapped to Host: 80        │  │
│  │  ✅ Enabled         │ │   │  └────────────────────────────┘  │
│  └────────────────────┘ │   │                                   │
│                          │   │  Instance Type: t3.micro          │
│  Cost: ~$0.50/month      │   │  Storage: 20 GB gp3               │
└────────────┬─────────────┘   │  Security Group: app-sg (port 80) │
             │                  │  Cost: ~$8/month                  │
             │ Pull Image       └───────────────┬───────────────────┘
             └──────────────────────────────────┘
                                               │
                                               │ HTTP Traffic
                                               ▼
                                        ┌─────────────┐
                                        │    Users    │
                                        │  (Internet) │
                                        └─────────────┘

### Security Architecture

┌──────────────────────────────────────────────────────────────────────┐
│                        SECURITY & AUTHENTICATION                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          IAM ROLES (No Keys!)                          │
└──────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────┐
    │  GitHub Actions OIDC: GitHubActionsDeployRole               │
    │                                                              │
    │  Authentication: OpenID Connect (OIDC)                       │
    │  ├─ No access keys stored anywhere! 🔐                      │
    │  ├─ Temporary credentials (1 hour validity)                 │
    │  ├─ Auto-expires automatically                              │
    │  └─ Cannot be reused outside GitHub Actions                 │
    │                                                              │
    │  Permissions:                                                │
    │  ✓ Push/Pull images to/from ECR                            │
    │  ✓ Send SSM commands to Application EC2                    │
    │  ✓ Describe EC2 instances                                  │
    │                                                              │
    │  Trust Policy: Only trusts GitHub OIDC provider             │
    └─────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────┐
    │  Application EC2 Instance Profile: AppEC2Role               │
    │                                                              │
    │  Permissions:                                                │
    │  ✓ Pull images from ECR (read-only)                        │
    │  ✓ Receive SSM commands                                    │
    │                                                              │
    │  Trust Policy: ec2.amazonaws.com can assume this role       │
    └─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT SECURITY (SSM)                          │
└──────────────────────────────────────────────────────────────────────┘

    Traditional SSH:                    SSM (What we use):
    ❌ Requires SSH keys                ✅ No keys needed
    ❌ Keys can be stolen               ✅ IAM role-based
    ❌ Port 22 open                     ✅ No inbound ports
    ❌ Manual key rotation              ✅ Automatic auth
    ❌ Hard to audit                    ✅ Full CloudTrail logs

### Data Flow Infrastructure

┌─────────────────────────────────────────────────────────────────────────┐
│                          BUILD & DEPLOY FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

1. CODE COMMIT
   ───────────
   Developer ──git push──▶ GitHub Repository
                                │
                                │ Webhook (instant)
                                ▼
2. BUILD TRIGGER
   ─────────────
   GitHub Actions detects change ──▶ Start Workflow


3. BUILD STAGE (with caching)
   ──────────────────────────
   
   ┌─────────────────────────────────────────────────┐
   │  First Build (No cache)                          │
   │  Time: ~5-8 minutes                              │
   │                                                  │
   │  1. Pull base image (node:18-alpine) ─▶ 2 min  │
   │  2. Install dependencies             ─▶ 3 min  │
   │  3. Build application                ─▶ 2 min  │
   │  4. Create final image               ─▶ 1 min  │
   │                                                  │
   │  Total: ~8 minutes                               │
   └─────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────┐
   │  Subsequent Builds (With cache)                  │
   │  Time: ~2-4 minutes (50-60% faster!)            │
   │                                                  │
   │  1. Reuse cached layers              ─▶ 30 sec  │
   │  2. Only rebuild changed layers      ─▶ 1 min   │
   │  3. Create final image               ─▶ 30 sec  │
   │  4. Tag & push                       ─▶ 1 min   │
   │                                                  │
   │  Total: ~3 minutes                               │
   └─────────────────────────────────────────────────┘


4. IMAGE TAGGING
   ─────────────
   
   Single build creates 4 tags:
   
   20240207-143022-456-a1b2c3d  ←── Full version (primary)
   v1.456                        ←── Semantic version
   latest                        ←── Always newest
   buildcache                    ←── For layer caching
   
   All pushed to ECR simultaneously


5. DEPLOYMENT STAGE
   ────────────────
   
   GitHub Actions ──SSM Command──▶ Application EC2
   
   Commands executed on EC2:
   ┌────────────────────────────────────────┐
   │ 1. ECR Login (using IAM role)          │
   │ 2. Pull new image                      │
   │ 3. Stop old container                  │
   │ 4. Remove old container                │
   │ 5. Start new container                 │
   │ 6. Save version to file                │
   │ 7. Clean up old images                 │
   │ 8. Verify container is running         │
   └────────────────────────────────────────┘


6. VERIFICATION
   ────────────
   
   GitHub Actions checks:
   ✓ Container is running
   ✓ Health check passes
   ✓ Version file updated
   
   If any check fails → Deployment marked as FAILED


7. USER ACCESS
   ───────────
   
   Internet User ──HTTP──▶ App EC2:80 ──▶ Docker Container:3000
                                          ──▶ React App

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
   
   1. User triggers rollback to v1.455
      │
      │ Via GitHub Actions workflow or CLI script
      │
      ▼
   2. GitHub Actions sends SSM command to EC2
      │
      │ Commands:
      │ • docker pull ECR_URI:v1.455
      │ • docker stop react-app
      │ • docker rm react-app
      │ • docker run ... ECR_URI:v1.455
      │ • echo v1.455 > /var/app/current-version.txt
      │
      ▼
   3. EC2 runs commands
      │
      │ Time: ~30-60 seconds
      │
      ▼
   4. Verification
      │
      ✓ Container running
      ✓ Version file updated
      │
      ▼
   5. Rollback Complete!
   
   App EC2 now running: v1.455 (20240207-120000-455-xyz1234)


Rollback Guarantees:
   ✓ All versions stored for 15 builds
   ✓ One-command rollback
   ✓ No code changes needed
   ✓ Same deployment process (reliable)
   ✓ Full audit trail in CloudWatch

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
IAM role with OIDC (GitHub Actions + Application)
ECR repository
EC2 instance (Application)
Security groups

### 3. Configure GitHub Secrets
1. Go to your repo → Settings → Secrets and variables → Actions
2. Click New repository secret
3. Add these 5 secrets:

NAME                  WHAT TO PUT                  WHERE TO GET IT
AWS_REGION            us-east-1                    Your AWS region
AWS_ROLE_ARN          arn:aws:iam::123..           From AWS IAM
ECR_REGISTRY          123.dkr.ecr.us-east-1...     From AWS ECR
ECR_REPOSITORY        react-app                    Your ECR repo name
EC2_INSTANCE_ID       i.0ab...                     From AWS EC2

### 4. Workflow Files Already Included
The repository includes:
- .github/workflows/deploy.yml - Main deployment
- .github/workflows/rollback.yml - Rollback workflow``

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
stage('Checkout')           # Clone repo, get git commit SHA
stage('AWS Auth OIDC')      # Get temporary credentials (no keys!)
stage('ECR Login')          # Authenticate to ECR (IAM role)
stage('Pull Cache')         # Download previous build layers
stage('Build Image')        # Build with BuildKit caching
stage('Push to ECR')        # Upload with 4 different tags
stage('Deploy via SSM')     # Remote deployment (no SSH)
stage('Verify')             # Confirm container is running

### Version Tagging Strategy
Each build creates a version like:
20240207-143022-456-a1b2c3d
│        │      │   │
│        │      │   └─ Git commit (7 chars)
│        │      └───── GitHub run number
│        └──────────── Timestamp (HHmmss)
└───────────────────── Date (YYYYMMDD)

Why this format?
✅ Chronologically sortable
✅ Unique for every build
✅ Easy to trace back to code
✅ Human-readable

### Docker Layer Caching
How it saves 50% time:

First build: Download everything

   FROM node:18-alpine          ← Downloaded (100 MB)
   COPY package.json            ← New layer
   RUN npm install              ← Downloaded deps (200 MB)
   COPY . .                     ← New layer
   RUN npm build                ← Build (2 min)

Second build (no code changes):

   FROM node:18-alpine          ← CACHED ✓ (0 sec)
   COPY package.json            ← CACHED ✓ (0 sec)
   RUN npm install              ← CACHED ✓ (0 sec)
   COPY . .                     ← CACHED ✓ (0 sec)
   RUN npm build                ← CACHED ✓ (0 sec)

Second build (code changed):

   FROM node:18-alpine          ← CACHED ✓ (0 sec)
   COPY package.json            ← CACHED ✓ (0 sec)
   RUN npm install              ← CACHED ✓ (0 sec)
   COPY . .                     ← REBUILD (new code)
   RUN npm build                ← REBUILD (1 min)

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

Go to Actions tab
Click Rollback Deployment workflow
Click Run workflow
Enter version: 20240207-120000-455-xyz1234
Click Run workflow

## 💰 Cost Analysis
**Cost Optimization Options**
Option 1: Spot Instances (Save 70%)

App: t3.micro Spot = $2/mo
Total: ~$3.50/mo (see SPOT_INSTANCES_GUIDE.md)

Option 2: Smaller Instances

App: t3.nano = $4/mo
Total: ~$5/mo

Option 3: Stop when not in use

Only run during work hours (8h/day, 5 days/week)
Total: ~$2/mo

GitHub Actions Free Tier

✅ 2,000 minutes/month (public repos)
✅ 500 MB storage
✅ Unlimited for public repos
Your typical build: ~3-5 minutes

## 🙏 Acknowledgments

- GitHub for free, powerful CI/CD
- AWS for comprehensive documentation
- Docker for containerization
- Everyone who contributed to making this project better