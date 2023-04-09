FROM node:16.4.0-buster-slim

WORKDIR /app

RUN mkdir -p /usr/share/man/man1 \
 && apt-get update \
 && apt-get install -y default-jre --no-install-recommends \
 && apt-get clean -y \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g firebase-tools
