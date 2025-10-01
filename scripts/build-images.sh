#!/bin/bash

sudo podman build -t localhost/policy-workflow:v0.0.1 ./Car_central_control/Dockerfile
sudo podman build -t localhost/emergency-brake:v0.0.1 ./EmergencyBrake_v1/Dockerfile 
sudo podman build -t localhost/emergency-brake:v0.0.2 ./EmergencyBrake_v2/Dockerfile 