pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['staging', 'production'], description: 'Select the environment')
    }

    stages {
        stage('build-image-staging') { 
            when {
                expression { params.ENVIRONMENT == 'staging' || params.ENVIRONMENT == 'production' }
            }
            steps {
                sh "git remote set-url origin https://${env.USERNAME_GITHUB_NEO}:${env.PASSWORD_GITHUB_NEO}@github.com/${env.USERNAME_GITHUB_NEO}/neogroup-backend-api-gateway-nest.git" 
                sh "git checkout -f master" 
                sh "git pull origin master" 
                sh "docker login -u ${env.REGISTRY_GITLAB_NEO_USERNAME} -p ${env.REGISTRY_GITLAB_NEO_PASSWORD} ${env.REGISTRY_GITLAB}" 
                sh "docker build --tag ${env.REGISTRY_GITLAB_NEO_IMAGE_NEOGROUP_BACKEND_API_GATEWAY_NEST}:staging -f ./build/Dockerfile.production ." 
                sh "docker push ${env.REGISTRY_GITLAB_NEO_IMAGE_NEOGROUP_BACKEND_API_GATEWAY_NEST}:staging"
            }
        }

        stage('deploy-staging') {
            when {
                expression { params.ENVIRONMENT == 'staging' || params.ENVIRONMENT == 'production' }
            }
            steps {
                script {
                    sh """\
                        cd /datadrive/gitops/staging/services/neogroup-backend-api-gateway-nest
                        docker login -u ${env.REGISTRY_GITLAB_NEO_USERNAME} -p ${env.REGISTRY_GITLAB_NEO_PASSWORD} ${env.REGISTRY_GITLAB}
                        docker compose -f docker-compose.staging.yml pull
                        docker compose -f docker-compose.staging.yml up -d --force-recreate
                        docker image prune -f
                        exit
                    """
                }
            }
        }

        stage('build-image-production') { 
            when {
                expression { params.ENVIRONMENT == 'production' }
            }
            steps {
                sh "git remote set-url origin https://${env.USERNAME_GITHUB_NEO}:${env.PASSWORD_GITHUB_NEO}@github.com/${env.USERNAME_GITHUB_NEO}/neogroup-backend-api-gateway-nest.git" 
                sh "git checkout -f main" 
                sh "git pull origin main" 
                sh "docker login -u ${env.REGISTRY_GITLAB_NEO_USERNAME} -p ${env.REGISTRY_GITLAB_NEO_PASSWORD} ${env.REGISTRY_GITLAB}" 
                sh "docker build --tag ${env.REGISTRY_GITLAB_NEO_IMAGE_NEOGROUP_BACKEND_API_GATEWAY_NEST}:production -f ./build/Dockerfile.production ." 
                sh "docker push ${env.REGISTRY_GITLAB_NEO_IMAGE_NEOGROUP_BACKEND_API_GATEWAY_NEST}:production"
                sh "docker image prune -f"
            }
        }

        stage('deploy-production') { 
            when {
                expression { params.ENVIRONMENT == 'production' }
            }
            steps {
                script {
                    def sshUsername = env.SSH_CLOUD_AZURE_NEOGROUP_USERNAME
                    def sshIpAddress = env.SSH_CLOUD_AZURE_NEOGROUP_IP_ADDRESS

                    sh """\
                    ssh -tt ${sshUsername}@${sshIpAddress} << EOF
                        cd /datadrive/gitops/production/services/neogroup-backend-api-gateway-nest
                        docker compose -f docker-compose.production.yml pull
                        docker compose -f docker-compose.production.yml up -d --force-recreate
                        docker image prune -f
                        exit
                        exit
                    EOF
                    """
                }
            }
        }
    }
}