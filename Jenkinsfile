pipeline {
    agent any
    
    environment {
        // AWS Configuration
        AWS_REGION     = "us-east-1"
        IMAGE_REPO     = "react-app"
        ECR_REGISTRY   = "371409610452.dkr.ecr.us-east-1.amazonaws.com/react-app"
        IMAGE_TAG      = "v1.${BUILD_NUMBER}"
        VERSION_TAG    = "${new Date().format('yyyyMMdd-HHmmss')}-${BUILD_NUMBER}"
        FULL_IMAGE     = "${ECR_REGISTRY}/${IMAGE_REPO}"
        
        // EC2 Configuration
        TARGET_INSTANCE_ID = "i-0cb4827f5508cd4bf"
        CONTAINER_NAME = "react-app"
        CONTAINER_PORT = "80:3000"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    env.FULL_VERSION = "${VERSION_TAG}-${GIT_COMMIT_SHORT}"
                    echo "Building version: ${FULL_VERSION}"
                }
            }
        }
        
        stage('ECR Login') {
            steps {
                script {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    """
                }
            }
        }
        
        stage('Pull Cache Images') {
            steps {
                script {
                    sh """
                        docker pull ${FULL_IMAGE}:latest || true
                        docker pull ${FULL_IMAGE}:buildcache || true
                    """
                }
            }
        }
        
        stage('Build Image') {
            steps {
                script {
                    sh """
                        export DOCKER_BUILDKIT=1
                        
                        docker build \
                          --cache-from ${FULL_IMAGE}:latest \
                          --cache-from ${FULL_IMAGE}:buildcache \
                          --build-arg BUILDKIT_INLINE_CACHE=1 \
                          -t ${FULL_IMAGE}:${FULL_VERSION} \
                          -t ${FULL_IMAGE}:${IMAGE_TAG} \
                          -t ${FULL_IMAGE}:latest \
                          -t ${FULL_IMAGE}:buildcache \
                          .
                    """
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                script {
                    sh """
                        docker push ${FULL_IMAGE}:${FULL_VERSION}
                        docker push ${FULL_IMAGE}:${IMAGE_TAG}
                        docker push ${FULL_IMAGE}:latest
                        docker push ${FULL_IMAGE}:buildcache
                    """
                }
            }
        }
        
        stage('Deploy to EC2 via SSM') {
            steps {
                script {
                    echo "Deploying ${FULL_VERSION} to EC2 instance ${TARGET_INSTANCE_ID}"
                    
                    sh """
                        COMMAND_ID=\$(aws ssm send-command \
                          --instance-ids "${TARGET_INSTANCE_ID}" \
                          --document-name "AWS-RunShellScript" \
                          --parameters 'commands=[
                            "echo \\"[INFO] Logging into ECR...\\"",
                            "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}",
                            
                            "echo \\"[INFO] Pulling new image: ${FULL_IMAGE}:${FULL_VERSION}\\"",
                            "docker pull ${FULL_IMAGE}:${FULL_VERSION}",
                            
                            "echo \\"[INFO] Stopping old container...\\"",
                            "docker stop ${CONTAINER_NAME} || true",
                            "docker rm ${CONTAINER_NAME} || true",
                            
                            "echo \\"[INFO] Starting new container...\\"",
                            "docker run -d --name ${CONTAINER_NAME} --restart unless-stopped -p ${CONTAINER_PORT} ${FULL_IMAGE}:${FULL_VERSION}",
                            
                            "echo \\"[INFO] Saving version info...\\"",
                            "mkdir -p /var/app",
                            "echo ${FULL_VERSION} > /var/app/current-version.txt",
                            
                            "echo \\"[INFO] Cleaning up old images...\\"",
                            "docker image prune -f",
                            
                            "echo \\"[INFO] Deployment complete!\\"",
                            "docker ps | grep ${CONTAINER_NAME}"
                          ]' \
                          --region ${AWS_REGION} \
                          --output text \
                          --query 'Command.CommandId')
                        
                        echo "SSM Command ID: \$COMMAND_ID"
                        
                        echo "Waiting for deployment to complete..."
                        sleep 15
                        
                        STATUS=\$(aws ssm get-command-invocation \
                          --command-id "\$COMMAND_ID" \
                          --instance-id "${TARGET_INSTANCE_ID}" \
                          --region ${AWS_REGION} \
                          --query 'Status' \
                          --output text)
                        
                        echo "Deployment Status: \$STATUS"
                        
                        if [ "\$STATUS" != "Success" ]; then
                            echo "Deployment failed! Getting logs..."
                            aws ssm get-command-invocation \
                              --command-id "\$COMMAND_ID" \
                              --instance-id "${TARGET_INSTANCE_ID}" \
                              --region ${AWS_REGION}
                            exit 1
                        fi
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    sh """
                        echo "Verifying deployment on EC2..."
                        aws ssm send-command \
                          --instance-ids "${TARGET_INSTANCE_ID}" \
                          --document-name "AWS-RunShellScript" \
                          --parameters 'commands=[
                            "docker ps | grep ${CONTAINER_NAME}",
                            "cat /var/app/current-version.txt"
                          ]' \
                          --region ${AWS_REGION}
                    """
                }
            }
        }
        
        stage('Cleanup Jenkins') {
            steps {
                script {
                    sh """
                        docker rmi ${FULL_IMAGE}:${FULL_VERSION} || true
                        docker rmi ${FULL_IMAGE}:${IMAGE_TAG} || true
                        docker image prune -f
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Deployment successful!"
            echo "Version: ${FULL_VERSION}"
            echo "Image: ${FULL_IMAGE}:${FULL_VERSION}"
        }
        failure {
            echo "❌ Deployment failed!"
            echo "Check logs above for details"
        }
        always {
            sh 'docker logout ${ECR_REGISTRY} || true'
        }
    }
}
