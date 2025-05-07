#Make folder for test case input files w/ expected outputs
#Spins, Arrays, 2D Arrays, Binaries
#Different constraints
#3 of each

import requests
import json
import random

SERVER_URL = "http://127.0.0.1:8000/quantum"

def generate_quantum_tictactoe_qubo():
    """Generates a QUBO model for Quantum Tic-Tac-Toe, considering quantum superposition moves."""
    board_size = 3

    # Quantum-inspired variables: each cell can be in a superposition of X, O, or empty
    quantum_vars = {f"q_{i}{j}": {"type": "Binary"} for i in range(board_size) for j in range(board_size)}

    # Weighted move preferences (higher means preferred)
    move_weights = {
        "center": random.randint(3, 7),
        "corners": random.randint(1, 5),
        "edges": random.randint(1, 3)
    }

    default_weights = {
        (1, 1): move_weights["center"],  # Center move is high priority
        (0, 0): move_weights["corners"], (0, 2): move_weights["corners"],
        (2, 0): move_weights["corners"], (2, 2): move_weights["corners"],  # Corners
        (0, 1): move_weights["edges"], (1, 0): move_weights["edges"],
        (1, 2): move_weights["edges"], (2, 1): move_weights["edges"]  # Edges
    }

    # Objective function: Encourage quantum move diversity
    objective_terms = [
        f"{default_weights.get((i, j), 1)} * q_{i}{j}" for i in range(board_size) for j in range(board_size)
    ]
    objective = " + ".join(objective_terms)

    # Constraints: Each cell should have at most one quantum state (X or O)
    constraints = [
        {"lhs": f"q_{i}{j}", "comparison": "<=", "rhs": 1}
        for i in range(board_size) for j in range(board_size)
    ]

    qubo_model = {
        "variables": quantum_vars,
        "Constraints": constraints,
        "Objective": objective,
        "Weights": move_weights
    }

    return qubo_model

def send_request():
    """Sends a Quantum Tic-Tac-Toe QUBO JSON request to the server."""
    test_input = generate_quantum_tictactoe_qubo()
    response = requests.post(SERVER_URL, json=test_input)

    if response.status_code == 200:
        print("Server Response:", json.dumps(response.json(), indent=2))
    else:
        print("Error:", response.status_code, response.json())

if __name__ == "__main__":
    send_request()
