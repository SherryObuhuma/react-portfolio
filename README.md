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

┌─────────────────────────────────────────────────────────┐
│                   HOW IT ALL WORKS                      │
└─────────────────────────────────────────────────────────┘

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

sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant ECR as AWS ECR
    participant EC2 as EC2 App Server
    actor User as Users

    Note over Dev, User: CI/CD PIPELINE FLOW

    Dev->>GH: git push
    GH->>GHA: Webhook (instant)
    activate GHA
    Note right of GHA: 3. Build Docker (~3 min)
    GHA->>ECR: 4. Push Image
    GHA->>EC2: 5. Deploy!
    deactivate GHA

    EC2->>ECR: 6. Pull Image
    Note right of EC2: 7. Run Container
    EC2-->>GHA: 8. Verify ✓
    
    GH-->>Dev: 9. ✅ Done!
    User->>EC2: 10. Visit Site

### Detailed Component Architecture

flowchart TD
    subgraph Repo [GitHub Repository]
        direction TB
        W1[deploy.yml] --- W2[rollback.yml]
        SRC[Source Code + Dockerfile]
    end

    Repo -- "Push Event" --> GHA

    subgraph GHA [GitHub Actions - Free!]
        direction TB
        Runner["Runner: ubuntu-latest<br/>IAM: OIDC (No Keys! 🔐)"]
        Stages["<b>Pipeline Stages:</b><br/>1. Checkout<br/>2. AWS Auth<br/>3. ECR Login<br/>4. Build Image<br/>5. Push to ECR<br/>6. Deploy via SSM<br/>7. Verify"]
    end

    GHA -- "Push Image" --> ECR
    GHA -- "SSM Command" --> EC2

    subgraph ECR [AWS ECR]
        direction TB
        RepoName[<b>Repo: react-app</b>]
        Images["• v1.123<br/>• latest<br/>• buildcache"]
        Policy["Lifecycle: Keep last 15<br/>Scanning: ✅ Enabled"]
    end

    subgraph EC2 [Application EC2 Instance]
        direction TB
        IAM["IAM: ECRReadOnly + SSMManaged"]
        subgraph Docker [Docker Container]
            App["React Application<br/>Port: 3000 -> 80"]
        end
        Specs["Type: t3.micro<br/>Storage: 20GB gp3"]
    end

    ECR -- "Pull Image" --> EC2
    EC2 --> Users((Users<br/>Internet))

    %% Styling
    style Repo fill:#f9f9f9,stroke:#333
    style GHA fill:#e1f5fe,stroke:#01579b
    style ECR fill:#fff3e0,stroke:#e65100
    style EC2 fill:#e8f5e9,stroke:#1b5e20
    style Users fill:#fff,stroke:#333

### Security Architecture

sequenceDiagram
    participant GHA as GitHub Actions Runner
    participant OIDC as GitHub OIDC Provider
    participant AWS as AWS Security Token Service (STS)
    participant ECR as AWS ECR

    Note over GHA, ECR: Secure OIDC Handshake (Keyless)

    GHA->>OIDC: Request JWT (Identity Token)
    OIDC-->>GHA: Returns Signed JWT
    GHA->>AWS: Present JWT + Role ARN
    AWS->>OIDC: Verify Signature & Claims
    OIDC-->>AWS: Verified!
    AWS-->>GHA: Short-lived Temporary Credentials (1hr)
    GHA->>ECR: Push/Pull using Temp Token 🔐

### Data Flow Infrastructure

flowchart TD
    Start([1. Code Commit]) --> Trigger[2. GitHub Actions Trigger]
    
    subgraph BuildStage [3. Build & Cache Stage]
        direction TB
        CacheCheck{Cache Found?}
        CacheCheck -- Yes --> FastBuild[Fast Build: 2-4 min<br/>Reuse Layers]
        CacheCheck -- No --> FullBuild[Full Build: 5-8 min<br/>Fresh NPM Install]
        FastBuild --> Tagging
        FullBuild --> Tagging
    end

    subgraph Tagging [4. Image Tagging]
        T1[TIMESTAMP-SHA]
        T2[Semantic v1.0]
        T3[latest]
        T4[buildcache]
    end

    Tagging --> ECR[(5. AWS ECR Repository)]

    ECR --> SSM[6. Deployment via AWS SSM]

    subgraph EC2 [7. Commands on Server]
        direction TB
        P1[ECR Login] --> P2[Pull Image]
        P2 --> P3[Stop/Remove Old]
        P3 --> P4[Start New]
        P4 --> P5[Clean Local Images]
    end

    SSM --> EC2
    EC2 --> Verify{8. Verification}

    Verify -- Success --> Done[✅ Live!]
    Verify -- Fail --> Rollback[⚠️ Trigger Rollback]

    %% Styling
    style BuildStage fill:#f5f5f5,stroke:#333
    style ECR fill:#ff9900,color:#fff,stroke:#e65100
    style EC2 fill:#e8f5e9,stroke:#2e7d32
    style Verify fill:#fff9c4,stroke:#fbc02d

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
- stage('Checkout')           # Clone repo, get git commit SHA
- stage('AWS Auth OIDC')      # Get temporary credentials (no keys!)
- stage('ECR Login')          # Authenticate to ECR (IAM role)
- stage('Pull Cache')         # Download previous build layers
- stage('Build Image')        # Build with BuildKit caching
- stage('Push to ECR')        # Upload with 4 different tags
- stage('Deploy via SSM')     # Remote deployment (no SSH)
- stage('Verify')             # Confirm container is running

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
+ ✅ Human-readable

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
2. Click Rollback Deployment workflow
3. Click Run workflow
4. Enter version: 20240207-120000-455-xyz1234
5. Click Run workflow

## 💰 Cost Analysis
**Cost Optimization Options**

* Option 1: Spot Instances (Save 70%)

App: t3.micro Spot = $2/mo
Total: ~$3.50/mo 

* Option 2: Smaller Instances

App: t3.nano = $4/mo
Total: ~$5/mo

* Option 3: Stop when not in use

Only run during work hours (8h/day, 5 days/week)
Total: ~$2/mo

* GitHub Actions Free Tier

- 2,000 minutes/month (public repos)
- 500 MB storage
- Unlimited for public repos
Typical build: ~3-5 minutes

## 🙏 Acknowledgments

- GitHub for free, powerful CI/CD
- AWS for comprehensive documentation
- Docker for containerization
- Everyone who contributed to making this project better