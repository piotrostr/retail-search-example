#!/bin/bash

AVAILABLE_BILLING_ACCOUNT=$(
  gcloud beta billing accounts list \
  --filter open=true \
  --format="value(name)"
)

PROJECT=$(gcloud config get-value project)

gcloud beta billing projects link $PROJECT \
  --billing-account $AVAILABLE_BILLING_ACCOUNT
