#!/bin/bash

sudo podman build -t localhost/policy-workflow:v0.0.1 ./PolicyWorkflow
sudo podman build -t localhost/emergency-brake:v0.0.1 ./EmergencyBrake_v1 
sudo podman build -t localhost/emergency-brake:v0.0.2 ./EmergencyBrake_v2 
sudo podman build -t localhost/sim-head-unit:v0.0.1 ./SimHeadUnit 