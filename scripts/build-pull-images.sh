#!/bin/bash

sudo podman build --platform linux/amd64 -t localhost/policy-workflow:v0.0.1 ./PolicyWorkflow
sudo podman build --platform linux/amd64 -t localhost/sim-head-unit:v0.0.1 ./SimHeadUnit

sudo podman pull docker.io/ruipires99/instrument-cluster:v0.0.1
sudo podman pull docker.io/ruipires99/instrument-cluster:v0.0.2