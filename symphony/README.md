# Eclipse Symphony cloud management plane

Launch Symphony, an MQTT broker, and a read-only Symphony portal using the provided Docker Compose file:

```bash
# From the current folder
# If your docker-compose.yaml file is under a different folder, use:
# docker compose -f /path/to/your/docker-compose.yml up -d
docker compose up -d
```

#### Verify Access to Services

* To check access to Symphony REST API, you can send a test request to a `/greetings` route using tools like `curl`:
    ```bash
    curl http://localhost:8082/v1alpha2/greetings
    ```
    You should see a string `Hello from Symphony K8s control plane (S8C)` in response.

* (optional) To check access to the read-only Symphony portal, open a browser and navigate to `http://localhost:3000`. Login with user `admin` without a password. You should see the Symphony portal page. During your experiments, you can browse the Targets by clicking on the `Targets` link in the left panel.