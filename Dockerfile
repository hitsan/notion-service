FROM node:10-buster

RUN apt-get update -y

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs

RUN npm install -g firebase-tools
