#!/bin/bash

export SYMPHONY_API_URL=http://localhost:8082/v1alpha2/

TOKEN=$(curl -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":""}' "${SYMPHONY_API_URL}users/auth" | jq -r '.accessToken')

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/x-yaml" \
  --data-binary @../eclipse-symphony/workflows/update.yaml \
  http://localhost:8082/v1alpha2/campaigns/registry/update

