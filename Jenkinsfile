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
        IMAGE_TAG              = "latest"
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
                    bat 'npm install'
                    bat 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                dir('app') {
                    bat "docker build -t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Docker Push') {
            steps {
                bat 'docker login'
                bat "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat "kubectl set image deployment/simple-node-demo simple-node-demo=${IMAGE_NAME}:latest"
                bat "kubectl rollout status deployment/simple-node-demo --timeout=90s"
            }
        }

        // stage('Verify') {
        //     steps {
        //         bat 'kubectl get pods -l app=simple-node-demo'
        //         bat '''
        //         for /f %%i in ('minikube service simple-node-demo-svc --url') do set URL=%%i
        //         curl.exe %URL%
        //         '''
        //     }
        // }
    }

    post {
        success {
            echo "Pipeline succeeded -- ${IMAGE_NAME}:latest is live on Kubernetes"
        }
        failure {
            echo "Pipeline failed -- check the stage logs above"
        }
    }
}
