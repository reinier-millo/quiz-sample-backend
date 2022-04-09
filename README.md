# Quiz Backend API

## Installation of the service

- Clone the repository

```bash
git clone git@github.com:reinier-millo/quiz-sample-backend.git
```

- Install dependencies

```bash
cd quiz-sample-backend
npm install
```

- Build the project

```bash
npm run build
```

## Running the service

The service can be runned directly from the command line with:

```bash
npm run start
```

or it can be build and runned watching for file changes

```bash
npm run dev
```

To run the service there are some environment variables that can be used to configure it:

- `LOG`: Set the vebose level of the service debugger, allowed values are: error, warn, info, http, verbose, debug, silly (Default: error)
- `PORT`: Set the running port for the HTTP server (Default: 3000)
- `INTERFACE`: Set the HTTP server listening interface (Default: 127.0.0.1)
- `ENV`: Set the service running mode, allowd values are: dev, production (Default: dev)
- `INSTANCES`: Set the number o workers runing into the cluster (Default: 1)
- `MONGODB_URI`: MongoDB URI connection. It must be set in order to allow the API connect to database server.

This variables can be set in the environment level, command line running the service or using a `.env` file in the project root.

## Deploy on server

The deploy process can be achieved using directly the service with any NodeJS process manager or using Docker. In the following sections will use first PM2 and the Docker to deploy the service API.

### Run as service

To allow the microservice to run as system service, first you must install `pm2`:

```bash
npm i -g pm2
```

After that, you must create the ecosystem file to launch the service:

```bash
nano ecosystem.config.js
```

The `ecosystem.config.js` file contains the following lines:

```json
module.exports = {
  apps : [{
    name: 'QUIZ-API',
    script: 'dist/index.js',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'development',
      ENV: 'dev',
      PORT: 3000,
      INSTANCES: 2,
      LOG: 'debug',
      MONGODB_URI: '<you MongoDB URI connection>'
    },
  }],
};

```

To start the service run the folowing lines:

```bash
pm2 start ecosystem.config.js
pm2 save
```

Now the accounts microservice is running as system service.

### Configure Nginx web server

To allow access the service from external,you must configure a new virtual host in the Nginx server:

```bash
nano /etc/nginx/sites-availables/quiz-api.example.com
```

With the following code:

```
upstream mod-quiz-api {
  server localhost:3000;
}

server {
  listen 80;
  listen [::]:80;
  server_name quiz-api.example.com;

  location / {
    proxy_pass http://mod-quiz-api/;
    proxy_http_version 1.1;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 600s;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Caller-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

And then enable the virtual host:

```bash
ln -s /etc/nginx/sites-available/quiz-api.example.com /etc/nginx/sites-enabled/quiz-api.example.com
```

To allow secure access to the service, use Let's Encrypt certificates. Certificates can be installed with the `certbot` tool:

```bash
certbot --nginx -d quiz-api.example.com
```

Now you can restart or reload the Nginx server and test the microservice.

### Running with Docker

To run the API with docker first we need to build the Docker image using the provided `Dockerfile` in the project root

```bash
docker build -t quiz-sample .
```

Also can use the run script `deploy` provided into the project. This script will compile the project and then build the Docker image

```bash
npm run deploy
# npm run build && docker build -t quiz-sample .
```

After the image is generated we are ready to run the Docker container using the generted image. Container can be executed manually or using the system service manager. In this case we are going to use `SystemD` to run the container as service. For this we need to generate the configuration file inside `/etc/systemd/system/quiz.service` with the following content

```
[Unit]
Description=Quiz API Service
After=docker.service
Requires=docker.service

[Service]
TimeoutStartSec=0
User=docker
Group=docker
Restart=always
ExecStartPre=-/usr/bin/docker stop %n
ExecStart=/usr/bin/docker run --rm --name %n \
    -e LOG=debug \
    -e MONGODB_URI='<your MongoDB connection URI>' \
    -p 127.0.0.1:3000:8000 \
    -t quiz-sample:latest
ExecStop=-/usr/bin/docker stop %n

[Install]
WantedBy=default.target
```

In this case must take into account that the Docker image published the port `8000`, and the script it's mapping it to the port `3000` on the local interface. You can adjust this for your needs. The Docker container name will be same as the configuration file, for example `quiz.service`. To see docker logs or connect to the container we can use this name.

After that it's time to enable and run our new service:

```bash
systemctl enable quiz.service
systemctl start quiz.service
```

To check that our service it's running can check the containet logs

```bash
docker logs quiz.service
```

Now to publish the service to internet through a reverse proxy you can proceed with the same configuration explained for Nginx in previous section.

.: Happy Coding :.
Enjoy it.