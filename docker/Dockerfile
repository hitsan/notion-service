FROM node:20.11-buster-slim

ARG USER_ID
ARG GROUP_ID
ARG USER

# Make user
RUN userdel -r node
ENV HOME /home/${USER}
RUN groupadd -g ${GROUP_ID} ${USER} \
 && useradd -u ${USER_ID} -g ${GROUP_ID} -m ${USER} \
 && mkdir -p /home/${USER}/.ssh \
 && chown -R ${USER}:${USER} ${HOME}

RUN mkdir -p /usr/share/man/man1
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends \
    default-jre \
    git \
    ssh \
 && apt-get clean -y \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

# Set ssh-key
USER ${USER}
WORKDIR /home/${USER}
RUN ssh-keyscan github.com >> ${HOME}/.ssh/known_hosts

RUN npm config set prefix=${HOME}/.npm_global \
 && npm install -g firebase-tools