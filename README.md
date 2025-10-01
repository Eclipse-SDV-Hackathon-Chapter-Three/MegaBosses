# MegaBosses

## Mission: Update Possible 🚗⚡

## The Challenge
Modern vehicles aren’t just engines and wheels anymore — they’re powerful, software-driven platforms with dozens of interconnected ECUs, sensors, and services. But delivering secure, reliable Over-the-Air (OTA) updates at scale? That’s still a big challenge. Update Possible invites you to take on one of the hottest technical problems in the software-defined vehicle world: designing an open, end-to-end OTA update system using cutting-edge tools like [Eclipse Symphony](https://github.com/eclipse-symphony/symphony)
, [Eclipse uProtocol](https://uprotocol.org/), and in-vehicle orchestrators such as [Eclipse Ankaios](https://eclipse-ankaios.github.io/ankaios/0.6/) and [Eclipse Muto](https://github.com/eclipse-muto).



## Installation

### Install Podman

On Ubuntu:


```bash
sudo apt update
sudo apt-get -y install podman
sudo apt-get -y install jq
```


Otherwise follow the official [Podman installation instructions](https://podman.io/docs/installation#installing-on-linux).

### Install Docker

Follow the instructions in the official [Install Docker Engine Guideline](https://docs.docker.com/engine/install/). Next, [intall docker compose](https://docs.docker.com/compose/install/).

### Install Ankaios

Install Eclipse Ankaios with a single curl command as described in the [Ankaios installation guide](https://eclipse-ankaios.github.io/ankaios/latest/usage/installation).

Follow the `Setup with script` section and install version v0.6.0.


### Install Symphony

No installation is required; the cloud component is launched via Docker Compose.



### Start the cloud part

To run the application start by Symphony, an MQTT broker, and a read-only Symphony portal using the provided Docker Compose file:

```bash
docker compose -f /symphony/docker-compose.yaml up -d
```

#### Starting the management platform app (Challenge 1)



### Start the in-vehicle part

Before running the Ankaios manifest [state.yaml] you must build the container images for the car apps to test the update and for the car_control (that will run the policy workflow) with:
```bash
sudo podman build -t localhost/policy-workflow:v0.0.1 ./Car_central_control
sudo podman build -t localhost/emergency-brake:v0.0.1 ./EmergencyBrake_v1 
sudo podman build -t localhost/emergency-brake:v0.0.2 ./EmergencyBrake_v2 
```

Start the Ankaios server and Ankaios agent with systemd:

```bash
sudo systemctl start ank-server ank-agent
```

To run the over-the-air (OTA) scenario, just apply the [state.yaml](./ankaios/state.yaml) containing the workloads:

```bash
ank apply ankaios/state.yaml
```

#### Open the app to check cluster 
With the ankaios agent running, we now can access a central console of a car in http://localhost:8085. In case a valid campaign is started and all the safety measures are guaranteed a pop-up message will appear on screen to allow the user to actively allow the updating process to start.
