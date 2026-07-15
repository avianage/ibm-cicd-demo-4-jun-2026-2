// Simple Node.js CI/CD demo pipeline
// Flow: Checkout -> Test -> Docker Build -> Docker Push (DockerHub) -> Deploy (Kubernetes/Minikube) -> Verify
//
// One-time setup before running:
//   1. Jenkins > Manage Jenkins > Credentials > add "Username with password"
//      with ID "dockerhub-creds" (your DockerHub username + access token)
//   2. Update IMAGE_NAME below to <your-dockerhub-username>/ibm-cicd-demo
//   3. Run `kubectl apply -f k8s/` once manually so the Deployment/Service exist
//      before this pipeline tries to `kubectl set image` on it
//   4. Jenkins agent (native install) needs docker, kubectl, and node on PATH,
//      and its kubectl context must already point at docker-desktop

pipeline {
    agent any

    parameters {
        booleanParam(name: 'PUSH_TO_DOCKERHUB', defaultValue: true, description: 'Push image to Docker Hub')
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-cicd')
        IMAGE_NAME            = "ganesh0230/simple-node-demo"
        IMAGE_TAG              = "latest"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/jadhav-onkar/ibm-cicd-demo-4-jun-2026.git'
            }
        }

        stage('Install & Test') {
            steps {
                dir('app') {
                    bat 'npm install'
                    // bat 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                dir('app') {
                    bat "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Docker Push') {
            steps {
                bat "docker login"
                bat "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                bat "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Mirrors PUSH_TO_DOCKERHUB: if we didn't push, the image only
                    // exists locally, so tell Kubernetes to never attempt a registry
                    // pull -- just use whatever's already on the node.
                    def pullPolicy = params.PUSH_TO_DOCKERHUB ? 'IfNotPresent' : 'Never'
                    writeFile file: 'pull-policy-patch.yaml', text: """spec:
  template:
    spec:
      containers:
      - name: simple-node-demo
        imagePullPolicy: ${pullPolicy}
"""
                }
                bat "kubectl patch deployment simple-node-demo --patch-file=pull-policy-patch.yaml"
                bat "kubectl set image deployment/simple-node-demo simple-node-demo=${IMAGE_NAME}:${IMAGE_TAG}"
                bat "kubectl rollout status deployment/simple-node-demo --timeout=90s"
            }
        }

        // stage('Verify') {
        //     steps {
        //         bat "kubectl get pods -l app=ibm-cicd-demo"
        //         // Docker Desktop's Kubernetes exposes NodePort services on localhost directly
        //         bat "curl -s http://localhost:30080/health || true"
        //     }
        // }
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