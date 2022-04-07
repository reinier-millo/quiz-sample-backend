FROM node:16-bullseye-slim

LABEL maintainer="Reinier Millo Sánchez <reinier.millo88@gmail.com>" \
      version="1.0"

# Copy source code
WORKDIR /usr/src/app
RUN mkdir /usr/src/app/dist
COPY dist/ /usr/src/app/dist
COPY package.json /usr/src/app

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV production
ENV ENV production
ENV INTERFACE 0.0.0.0
ENV PORT 8000
ENV INSTANCES 1
ENV LOG debug
RUN npm install --production

# Expose service to the external
EXPOSE 8000

# Run service with pm2 monitor
CMD [ "npm", "run", "start"]
