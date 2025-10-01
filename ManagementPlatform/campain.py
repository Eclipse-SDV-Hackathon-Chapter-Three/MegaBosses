import requests
import json

symphony_base_url = "http://localhost:8080/v1alpha2"

def truck_detected():
    print("truck detected")

    # Authenticate and get the token
    auth_response = requests.post(
        f"{symphony_base_url}/users/auth",
        headers={"Content-Type": "application/json"},
        data=json.dumps({"username": "admin", "password": ""})
    )

    auth_response.raise_for_status()
    token = auth_response.json().get("accessToken")

    print(f'Authenticated successfully. Token: {token}')

    # Read the campaign activation data from the JSON file
    with open('campaign_activation.json', 'r') as file:
        campaign_data = json.load(file)

    # Activate the campaign
    activation_response = requests.post(
        f"{symphony_base_url}/activations/registry/update-activation",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        data=json.dumps(campaign_data)
    )

    activation_response.raise_for_status()  # Raise an error for bad status codes

    print("Campaign activated successfully")

truck_detected()
