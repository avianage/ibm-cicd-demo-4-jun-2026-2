// Simple Node.js CI/CD demo pipeline
// Flow: Checkout -> Test -> Docker Build -> Docker Push (DockerHub) -> Deploy (Kubernetes/Minikube) -> Verify
//
// One-time setup before running:
//   1. Jenkins > Manage Jenkins > Credentials > add "Username with password"
//      with ID "dockerhub-creds" (your DockerHub username + access token)
//   2. Update IMAGE_NAME below to <your-dockerhub-username>/simple-node-demo
//   3. Run `kubectl apply -f k8s/` once manually so the Deployment/Service exist
//      before this pipeline tries to `kubectl set image` on it
//   4. Jenkins agent (native install) needs docker, kubectl, and node on PATH,
//      and its kubectl context must already point at docker-desktop

pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-cicd')
        IMAGE_NAME            = "ganesh0230/simple-node-demo"
        IMAGE_TAG              = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/jadhav-onkar/ibm-cicd-demo-4-jun-2026'
            }
        }

        stage('Install & Test') {
            steps {
                dir('app') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                dir('app') {
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Docker Push') {
            steps {
                sh "echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin"
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh "kubectl set image deployment/simple-node-demo simple-node-demo=${IMAGE_NAME}:${IMAGE_TAG} --record"
                sh "kubectl rollout status deployment/simple-node-demo --timeout=90s"
            }
        }

        stage('Verify') {
            steps {
                sh "kubectl get pods -l app=simple-node-demo"
                // Docker Desktop's Kubernetes exposes NodePort services on localhost directly
                sh "curl -s http://localhost:30080/health || true"
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded -- ${IMAGE_NAME}:${IMAGE_TAG} is live on Kubernetes"
        }
        failure {
            echo "Pipeline failed -- check the stage logs above"
        }
    }
}
