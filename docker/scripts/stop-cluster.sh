#!/bin/bash

read_env() {
    local filePath="${1:-"./docker/envs/.env.development"}"

    if [ ! -f "$filePath" ]; then
        echo "Missing \"${filePath}\" file"

        exit 1
    fi

    echo "Reading \"$filePath\""

    while read -r LINE; do
        # Remove leading and trailing whitespaces, and carriage return
        CLEANED_LINE=$(echo "$LINE" | awk '{$1=$1};1' | tr -d '\r')

        if [[ $CLEANED_LINE != '#'* ]] && [[ $CLEANED_LINE == *'='* ]]; then
            export "$CLEANED_LINE"
        fi
    done <"$filePath"
}

read_env

cd ./terraform
tflocal destroy -auto-approve

cd ..
docker compose -f ./docker-compose.dev.yaml down
