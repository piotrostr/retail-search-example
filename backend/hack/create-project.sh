#!/bin/bash

# This script creates a project in the user's argolis environment

# Usage: ./setup-project.sh [PROJECT_NAME (optional)] 

if [ -z "$1" ]; then
    echo "No project name provided. Using gcloud config to determine account and make one."

    ACCOUNT=$(gcloud config get-value account)

    # replace . with - in account name
    ACCOUNT=${ACCOUNT//./-}

    if [ -z "$ACCOUNT" ]; then
        echo "No account set in gcloud config."
        echo "Please 'gcloud config set account [your-account]' or run 'gcloud auth login' and try again."
        exit 1
    fi

    PROJECT_NAME=$(echo "$ACCOUNT" | cut -d @ -f 1)-search-demo
else
    PROJECT_NAME=$1
fi

gcloud projects create $PROJECT_NAME

gcloud config set project $PROJECT_NAME
