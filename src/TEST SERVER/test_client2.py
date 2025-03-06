#Make folder for test case input files w/ expected outputs
#Spins, Arrays, 2D Arrays, Binaries
#Different constraints
#3 of each

import requests
import json
import os

SERVER_URL = "http://127.0.0.1:8000/quantum"
TEST_CASES_DIR = os.path.dirname(os.path.abspath(__file__))  # Get current directory

def load_test_case(filename):
    """Loads a test case JSON file from the same directory."""
    file_path = os.path.join(TEST_CASES_DIR, filename)
    
    if not os.path.exists(file_path):
        print(f"Error: Test case file '{filename}' not found.")
        return None
    
    with open(file_path, "r") as f:
        return json.load(f)

def send_request(test_case_file):
    """Loads JSON from a file and sends it to the server."""
    test_input = load_test_case(test_case_file)
    
    if test_input is None:
        return
    
    response = requests.post(SERVER_URL, json=test_input)
    
    if response.status_code == 200:
        print("Server Response:", json.dumps(response.json(), indent=2))
    else:
        print("Error:", response.status_code, response.text)

if __name__ == "__main__":
    test_file = input("Enter the test case filename: ")
    send_request(test_file)
