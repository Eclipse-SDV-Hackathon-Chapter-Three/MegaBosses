# Update Trigger Workload

The update trigger workload runs a Python fastapi backend and serves a web page with a simple button "Trigger Update".

You can trigger the update button and the update trigger workload uses the Ankaios Python SDK [ank-sdk-python](https://github.com/eclipse-ankaios/ank-sdk-python/tree/v0.6.0) to start the `symphony` workload dynamically on Ankaios.

Once the `symphony` workload is started it connects to the Symphony management plane in the cloud over MQTT to receive updates for applications.

## Build

Before running the Ankaios manifest [state.yaml](../../state.yaml) you must build the container image first with:

```shell
sudo podman build -t localhost/update_trigger:0.1 .
```

## Run

Apply the Ankaios manifest [state.yaml](../../state.yaml) to start the `udpate_trigger` workload in the demo scenario like described in [README.md](../../../README.md).