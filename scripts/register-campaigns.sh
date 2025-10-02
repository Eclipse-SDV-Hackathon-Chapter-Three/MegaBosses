#!/bin/bash

export SYMPHONY_API_URL=http://localhost:8082/v1alpha2/

TOKEN=$(curl -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":""}' "${SYMPHONY_API_URL}users/auth" | jq -r '.accessToken')

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data @./symphony/campaigns/update.json \
  http://localhost:8082/v1alpha2/campaigns/update-v-v1

curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8082/v1alpha2/campaigns
