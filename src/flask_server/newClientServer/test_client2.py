import requests
import json

SERVER_URL = "http://127.0.0.1:8000/quantum"

def create_test_payload():
    """Creates a JSON payload using only Binary, Spin, and Array variables."""
    test_json = {
        "variables": {
            "x1": {"type": "Binary"},
            "x2_0": {"type": "Binary"},
            "x2_1": {"type": "Binary"},
            "x_arr": {"type": "Array", "size": 5}
        },
        "Constraints": [
            {"lhs": "x1 + x2_0 + (2 * x2_1)", "comparison": "=", "rhs": 1},
            {"lhs": "(x1 * 2) + x2_0 + (2 * x2_1)", "comparison": "<=", "rhs": 3}
        ],
        "Objective": "(x1 * (x2_0 + (2 * x2_1))) - x1"
    }
    return test_json


def send_request():
    """Sends the test JSON to the server and prints the response."""
    test_input = create_test_payload()
    response = requests.post(SERVER_URL, json=test_input)

    if response.status_code == 200:
        print("Server Response:", json.dumps(response.json(), indent=2))
    else:
        print("Error:", response.status_code, response.text)

if __name__ == "__main__":
    send_request()
