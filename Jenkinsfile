pipeline  {
        agent  any
        
        environment  {
                //  AWS  Configuration
                AWS_REGION          =  credentials('aws-region')
                IMAGE_REPO          =  credentials('ecr-repository')
                ECR_REGISTRY      =  credentials('ecr-registry')
                IMAGE_TAG            =  "v1.${BUILD_NUMBER}"
                VERSION_TAG        =  "${new  Date().format('yyyyMMdd-HHmmss')}-${BUILD_NUMBER}"
                FULL_IMAGE          =  "${ECR_REGISTRY}/${IMAGE_REPO}"
                
                //  EC2  Configuration
                TARGET_INSTANCE_ID  =  credentials('ec2-instance-id')
                CONTAINER_NAME  =  "react-app"
                CONTAINER_PORT  =  "80:3000"
        }
        
        stages  {
                stage('Checkout')  {
                        steps  {
                                checkout  scm
                                script  {
                                        env.GIT_COMMIT_SHORT  =  sh(
                                                script:  "git  rev-parse  --short  HEAD",
                                                returnStdout:  true
                                        ).trim()
                                        env.FULL_VERSION  =  "${VERSION_TAG}-${GIT_COMMIT_SHORT}"
                                        echo  "Building  version:  ${FULL_VERSION}"
                                }
                        }
                }
                
                stage('Debug  Credentials'){
                        steps  {
                                sh  """
                                echo  "Checking  AWS  CLI  identity"
                                aws  sts  get-caller-identity  ||  echo  "AWS  CLI  failed  -  Check  IAM  Role"
                                """
                        }
                }
                stage('ECR  Login')  {
                        steps  {
                                withCredentials([string(credentialsId:  'ecr-repository',  variable:  'REPO_SECRET')])  {        
                                        sh  """
                                                echo  "Logging  into  ECR..."
                                                aws  ecr  get-login-password  --region  ${AWS_REGION}  |  \
                                                docker  login  --username  AWS  --password-stdin  ${ECR_REGISTRY}
                                        """
                                }
                        }
                }
                
                stage('Pull  Cache  Images')  {
                        steps  {
                                sh  """
                                        docker  pull  ${FULL_IMAGE}:latest  ||  true
                                        docker  pull  ${FULL_IMAGE}:buildcache  ||  true
                                """
                        }
                }
                
                stage('Build  Image')  {
                        steps  {
                                sh  """
                                        export  DOCKER_BUILDKIT=1
                                        docker  build  \
                                            --cache-from  ${FULL_IMAGE}:latest  \
                                            --cache-from  ${FULL_IMAGE}:buildcache  \
                                            --build-arg  BUILDKIT_INLINE_CACHE=1  \
                                            -t  ${FULL_IMAGE}:${FULL_VERSION}  \
                                            -t  ${FULL_IMAGE}:${IMAGE_TAG}  \
                                            -t  ${FULL_IMAGE}:latest  \
                                            -t  ${FULL_IMAGE}:buildcache  \
                                            .
                                """
                        }
                }
                
                stage('Push  to  ECR')  {
                        steps  {
                                sh  """
                                        docker  push  ${FULL_IMAGE}:${FULL_VERSION}
                                        docker  push  ${FULL_IMAGE}:${IMAGE_TAG}
                                        docker  push  ${FULL_IMAGE}:latest
                                        docker  push  ${FULL_IMAGE}:buildcache
                                """
                        }
                }
                
                stage('Deploy  to  EC2  via  SSM')  {
                        steps  {
                                script  {
                                        echo  "Deploying  ${FULL_VERSION}  to  EC2  instance  ${TARGET_INSTANCE_ID}"
                                        sh  """
                                                COMMAND_ID=\$(aws  ssm  send-command  \
                                                    --instance-ids  "${TARGET_INSTANCE_ID}"  \
                                                    --document-name  "AWS-RunShellScript"  \
                                                    --parameters  'commands=[
                                                        "aws  ecr  get-login-password  --region  ${AWS_REGION}  |  docker  login  --username  AWS  --password-stdin  ${ECR_REGISTRY}",
                                                        "docker  pull  ${FULL_IMAGE}:${FULL_VERSION}",
                                                        "docker  stop  ${CONTAINER_NAME}  ||  true",
                                                        "docker  rm  ${CONTAINER_NAME}  ||  true",
                                                        "docker  run  -d  --name  ${CONTAINER_NAME}  --restart  unless-stopped  -p  ${CONTAINER_PORT}  ${FULL_IMAGE}:${FULL_VERSION}",
                                                        "docker  image  prune  -f"
                                                    ]'  \
                                                    --region  ${AWS_REGION}  \
                                                    --output  text  \
                                                    --query  'Command.CommandId')
                                                
                                                echo  "SSM  Command  ID:  \$COMMAND_ID"
                                                sleep  15
                                        """
                                }
                        }
                }
                
                stage('Cleanup  Jenkins  &  logout')  {
                        steps  {
                                sh  """
                                        docker  rmi  ${FULL_IMAGE}:${FULL_VERSION}  ||  true
                                        docker  rmi  ${FULL_IMAGE}:${IMAGE_TAG}  ||  true
                                        docker  logout  ${ECR_REGISTRY}  ||  true
                                        docker  image  prune  -f
                                """
                        }
                }
        }
        
        post  {
                success  {
                        echo  "✅  Deployment  successful!"
                }
                failure  {
                        echo  "❌  Deployment  failed!"
                }
        }
}