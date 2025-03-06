import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyqubo import Binary, Spin

import json

app = Flask(__name__)
CORS(app)

# Directory for storing workspace JSON files
WORKSPACE_DIR = "workspaces"
os.makedirs(WORKSPACE_DIR, exist_ok=True)  # Ensure directory exists

def parse_variables(variable_data):
    """Parse variables from JSON and create PyQUBO variables."""
    variables = {}

    for var_name, var_info in variable_data.items():
        if var_info["type"] == "Binary":
            variables[var_name] = Binary(var_name)
        elif var_info["type"] == "Spin":
            variables[var_name] = Spin(var_name)
        elif var_info["type"] == "Array":
            size = var_info.get("size", 10)
            variables[var_name] = [Binary(f"{var_name}[{i}]") for i in range(size)]
        else:
            return jsonify({"error": f"Unsupported variable type: {var_info['type']}"}), 400  # Reject unsupported types
    
    return variables


def parse_constraints(constraint_data, variables):
    """Parse constraints from JSON and convert them to PyQUBO format."""
    constraints = []
    
    for constraint in constraint_data:
        lhs_expr = constraint.get("lhs", "0")
        comparison = constraint.get("comparison", "=")
        rhs = constraint.get("rhs", 0)
        
        try:
            # Use eval() safely with predefined variables
            lhs = eval(lhs_expr, {}, variables)

            if comparison == "=":
                constraints.append((lhs - rhs) ** 2)  # Enforce equality
            elif comparison == "<=":
                constraints.append((lhs - rhs) * (lhs - rhs))  # Penalize if lhs > rhs
            elif comparison == ">=":
                constraints.append((rhs - lhs) * (rhs - lhs))  # Penalize if lhs < rhs
            elif comparison == "!=":
                constraints.append((lhs - rhs) ** 2 * 100)  # Large penalty to enforce inequality
        except Exception as e:
            return jsonify({"error": f"Invalid constraint expression: {lhs_expr}, {str(e)}"}), 400

    return constraints


def parse_objective(objective_expr, variables):
    """Parse objective function from JSON."""
    try:
        return eval(objective_expr, {}, variables)
    except Exception as e:
        return jsonify({"error": f"Invalid objective expression: {objective_expr}, {str(e)}"}), 400

@app.route('/quantum', methods=['POST'])
def calculate():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        # Parse quantum variables (supports q_ij notation)
        variables = parse_variables(data.get("variables", {}))
        
        # Parse constraints
        constraints = parse_constraints(data.get("Constraints", []), variables)
        if isinstance(constraints, tuple):  # Catch errors
            return constraints
        
        # Parse objective function
        objective = parse_objective(data.get("Objective", "0"), variables)
        if isinstance(objective, tuple):  # Catch errors
            return objective
        
        # Build final QUBO model
        qubo_model = sum(constraints) + objective
        compiled_qubo = qubo_model.compile()
        qubo, offset = compiled_qubo.to_qubo()

        # Convert tuple keys to strings (JSON does not support tuple keys)
        qubo_str_keys = {str(k): v for k, v in qubo.items()}

        return jsonify({'qubo': qubo_str_keys, 'offset': offset}), 200

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
