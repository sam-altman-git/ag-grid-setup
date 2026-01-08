pipeline {
     agent any
     environment {
      NODE_OPTIONS = "--max-old-space-size=8192"
     }
     stages {
        // stage("Clone") {
        //     steps {
        //         sh "sudo cp -r ${WORKSPACE}/* /var/app/forms/nextjs/"
        //         sh "sudo cp -r ${WORKSPACE}/.ignored /var/app/forms/nextjs/"
        //     }
        // }
        // stage("Change Directory") {
        //     steps {
        //         sh "cd /var/app/forms/nextjs/"
        //     }
        // }
        stage("Package Install") {
            steps {
                sh "sudo yarn install --unsafe-perm || exit 0"
            }
        }
        stage("Stop and Build") {
            steps {
              // Set NODE_OPTIONS environment variable
                // script {
                //   env.NODE_OPTIONS = "--max-old-space-size=6144"
                // }
                sh "sudo pm2 stop nextjs-app"
                sh "sudo rm -Rf /var/app/forms/nextjs/.next || exit 0"
                sh "sudo yarn build || exit 0"
            }
        }
        stage("Deploy") {
            steps {
                sh "sudo cp -r ${WORKSPACE}/* /var/app/forms/nextjs/"
                sh "sudo cp -r ${WORKSPACE}/.next /var/app/forms/nextjs/"
            }
        }
        stage("Restart") {
            steps {
                sh "sudo pm2 restart nextjs-app"
            }
        }
    }
}