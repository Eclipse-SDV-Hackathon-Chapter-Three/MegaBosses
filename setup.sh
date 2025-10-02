#!/bin/bash

docker compose -f ./symphony/docker-compose.yaml down
docker compose -f ./symphony/docker-compose.yaml up -d
docker compose -f ./ManagementPlatform/docker-compose.yml down
docker compose -f ./ManagementPlatform/docker-compose.yml up -d

chmod +x ./scripts/build-pull-images.sh 
./scripts/build-pull-images.sh 

sudo systemctl start ank-server ank-agent

ank apply -d ankaios/state.yaml

ank apply ankaios/state.yaml

chmod +x ./scripts/register-campaigns.sh 
./scripts/register-campaigns.sh