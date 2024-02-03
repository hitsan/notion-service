#!/bin/bash

export ROOT_DIR=$(pwd)/..
export USER_ID=$(id -u)
export GROUP_ID=$(id -g)
export USER=$(whoami)
if [ "$1" = "up" ]; then
    docker compose up -d
elif [ "$1" = "down" ]; then
    docker compose down
elif [ "$1" = "build" ]; then
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_rsa
    docker compose build
else
    echo "Invalid argument. Please specify 'up', 'down' or 'build'."
fi