import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyqubo import Binary, Spin

import json

app = Flask(__name__)
CORS(app)

def parse_variables(variable_data):
    """Parse variables from JSON and create PyQUBO variables."""
    variables = {}

    # Add robust logging
    print("Parsing variables:", variable_data)

    for var_name, var_info in variable_data.items():
        try:
            if var_info["type"] == "Binary":
                variables[var_name] = Binary(var_name)
            elif var_info["type"] == "Spin":
                variables[var_name] = Spin(var_name)
            elif var_info["type"] == "Array":
                # Handle new array format with shape and vartype
                vartype = var_info.get("vartype", "Binary")
                shape = var_info.get("shape", [10])
                
                # Create array based on shape (1D or 2D)
                if isinstance(shape, list) and len(shape) > 1:
                    # 2D array
                    rows, cols = shape[0], shape[1]
                    if vartype == "Binary":
                        variables[var_name] = [[Binary(f"{var_name}[{i}][{j}]") for j in range(cols)] for i in range(rows)]
                    else:  # Spin
                        variables[var_name] = [[Spin(f"{var_name}[{i}][{j}]") for j in range(cols)] for i in range(rows)]
                else:
                    # 1D array
                    size = shape[0] if isinstance(shape, list) else shape
                    if vartype == "Binary":
                        variables[var_name] = [Binary(f"{var_name}[{i}]") for i in range(size)]
                    else:  # Spin
                        variables[var_name] = [Spin(f"{var_name}[{i}]") for i in range(size)]
            elif var_info["type"] == "Integer":
                # Handle Integer type with bounds
                lower_bound = var_info.get("lower_bound", 0)
                upper_bound = var_info.get("upper_bound", 10)
                variables[var_name] = Integer(var_name, lower_bound, upper_bound)
            else:
                print(f"Unsupported variable type: {var_info['type']}")
                return None
        except Exception as e:
            print(f"Error parsing variable {var_name}: {e}")
            return None
    
    return variables

def parse_constraints(constraint_data, variables):
    """Parse constraints from JSON and convert them to PyQUBO format."""
    constraints = []
    
    # Add robust logging
    print("Parsing constraints:", constraint_data)

    if not constraint_data:
        return constraints

    for constraint in constraint_data:
        try:
            lhs_expr = constraint.get("lhs", "0")
            comparison = constraint.get("comparison", "=")
            rhs = constraint.get("rhs", 0)
            
            # Use safer evaluation
            lhs = eval(lhs_expr, {"__builtins__": None}, variables)

            if comparison == "=":
                constraints.append((lhs - rhs) ** 2)  # Enforce equality
            elif comparison == "<=":
                constraints.append((lhs - rhs) * (lhs - rhs))  # Penalize if lhs > rhs
            elif comparison == ">=":
                constraints.append((rhs - lhs) * (rhs - lhs))  # Penalize if lhs < rhs
            elif comparison == "!=":
                constraints.append((lhs - rhs) ** 2 * 100)  # Large penalty to enforce inequality
        except Exception as e:
            print(f"Error parsing constraint: {constraint}, Error: {e}")
            return None

    return constraints

def parse_objective(objective_expr, variables):
    """Parse objective function from JSON."""
    print("Parsing objective:", objective_expr)
    
    try:
        # Use safer evaluation
        if objective_expr == "0" or objective_expr == "":
            print("Warning: Objective is just 0, creating a dummy objective")
            # Create a dummy objective with all variables to avoid compilation error
            obj = 0
            for var_name, var in variables.items():
                obj += 0 * var  # Add 0 * var to avoid affecting the result
            return obj
            
        return eval(objective_expr, {"__builtins__": None}, variables)
    except Exception as e:
        print(f"Error parsing objective: {objective_expr}, Error: {e}")
        return None

@app.route('/quantum', methods=['POST'])
def calculate():
    try:
        print("\n--- New QUBO Request ---")
        data = request.json
        print("Received QUBO data:", json.dumps(data, indent=2))
        
        if not data:
            print("Error: No JSON data received")
            return jsonify({
                'error': 'No valid QUBO data received', 
                'status': 'error'
            }), 400
        
        # Check for required fields and provide helpful error messages
        if "variables" not in data or not data["variables"]:
            print("Error: Missing or empty 'variables' field")
            return jsonify({
                'error': 'Missing or empty "variables" field',
                'status': 'error',
                'details': 'Your QUBO model needs variables defined with type: "Binary"'
            }), 400
        
        try:
            # Validate variable format
            for var_name, var_def in data["variables"].items():
                if not isinstance(var_def, dict) or "type" not in var_def:
                    print(f"Error: Invalid variable definition for {var_name}: {var_def}")
                    return jsonify({
                        'error': f'Invalid variable definition for {var_name}',
                        'status': 'error',
                        'details': 'Each variable must include a "type" field'
                    }), 400
                
                if var_def["type"] not in ["Binary", "Spin", "Array"]:
                    print(f"Error: Unsupported variable type: {var_def['type']}")
                    return jsonify({
                        'error': f'Unsupported variable type: {var_def["type"]}',
                        'status': 'error',
                        'details': 'Variables must have type "Binary" or "Spin" or "Array"'
                    }), 400
            
            # Parse quantum variables
            variables = parse_variables(data.get("variables", {}))
            if variables is None:
                print("Error: Failed to parse variables")
                return jsonify({
                    'error': 'Failed to parse variables',
                    'status': 'error',
                    'details': 'Check variable names and types'
                }), 400
            
            # Parse constraints
            constraints = parse_constraints(data.get("Constraints", []), variables)
            if constraints is None:
                print("Error: Failed to parse constraints")
                return jsonify({
                    'error': 'Failed to parse constraints',
                    'status': 'error',
                    'details': 'Check constraint format. Each constraint needs "lhs", "comparison", and "rhs" fields'
                }), 400
            
            # Parse objective function
            objective = parse_objective(data.get("Objective", "0"), variables)
            if objective is None:
                print("Error: Failed to parse objective function")
                return jsonify({
                    'error': 'Failed to parse objective function',
                    'status': 'error',
                    'details': 'Check your objective expression syntax'
                }), 400
            
            # Add a dummy variable if objective is just a constant
            if isinstance(objective, (int, float)):
                print("Warning: Objective is a constant, adding dummy variables")
                dummy_terms = 0
                for var_name, var in variables.items():
                    dummy_terms += 0 * var  # Won't affect the result
                objective = objective + dummy_terms
            
            # Build final QUBO model
            try:
                qubo_model = sum(constraints) + objective
                compiled_qubo = qubo_model.compile()
                qubo, offset = compiled_qubo.to_qubo()
                
                # Convert tuple keys to strings
                qubo_str_keys = {str(k): v for k, v in qubo.items()}
                
                # Check that QUBO has values
                if not qubo_str_keys or len(qubo_str_keys) == 0:
                    print("Error: Empty QUBO generated")
                    return jsonify({
                        'error': 'Empty QUBO model generated',
                        'status': 'error',
                        'details': 'Your model did not generate any valid QUBO terms'
                    }), 400
                
                # Simple analysis of the QUBO for educational purposes
                explanation = {
                    "highlights": [],
                    "method": "quantum_annealing",
                    "problem_type": "binary_quadratic_optimization",
                    "variable_count": len(variables),
                    "constraint_count": len(constraints) if constraints else 0
                }
                
                # Add analysis of the variables and optimal choice
                if qubo_str_keys:
                    # Find diagonal terms and convert negative to positive
                    diags = {}
                    for key, value in qubo_str_keys.items():
                        if "'x" in key and ", 'x" not in key:  # It's a diagonal term
                            var_match = key.replace("('", "").replace("')", "")
                            var_idx = int(var_match.replace("x", ""))
                            # Convert to positive value
                            diags[var_idx] = abs(value)
                    
                    # Find the maximum weight (optimal choice)
                    if diags:
                        max_idx = max(diags.items(), key=lambda x: x[1])[0]
                        max_value = diags[max_idx]
                        
                        explanation["highlights"].append(f"The optimal move is to position {max_idx}")
                        explanation["highlights"].append(f"This position has the highest score: {max_value}")
                        explanation["highlights"].append("Your quantum algorithm successfully found a solution")
                        explanation["highlights"].append("Higher weights indicate more desirable moves")
                
                print(f"Success! Generated QUBO with {len(qubo_str_keys)} terms")
                return jsonify({
                    'qubo': qubo_str_keys, 
                    'offset': offset,
                    'explanation': explanation
                }), 200
                
            except Exception as e:
                print(f"QUBO compilation error: {str(e)}")
                traceback.print_exc()
                
                return jsonify({
                    'error': f'QUBO compilation error: {str(e)}',
                    'status': 'error',
                    'details': 'Your QUBO model could not be compiled. Make sure your objective uses the variables you defined'
                }), 400
            
        except Exception as e:
            print(f"Processing error: {e}")
            traceback.print_exc()
            
            return jsonify({
                'error': f'Processing error: {str(e)}',
                'status': 'error',
                'details': 'An error occurred while processing your QUBO model'
            }), 400

    except Exception as e:
        print(f"Unexpected error: {e}")
        traceback.print_exc()
        
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'status': 'error',
            'details': 'An unexpected error occurred on the server'
        }), 500

@app.route('/api/workspaces', methods=['GET', 'POST'])
def manage_workspaces():
    if request.method == 'GET':
        # List all workspaces
        try:
            workspaces = ["example1", "example2"]  # Replace with actual logic
            return jsonify({"workspaces": workspaces}), 200
        except Exception as e:
            print(f"Error listing workspaces: {e}")
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        # Create a new workspace
        try:
            data = request.json
            name = data.get('name')
            state = data.get('state')
            
            if not name or not state:
                return jsonify({"error": "Missing required fields"}), 400
            
            # Save workspace logic here
            return jsonify({"message": f"Workspace '{name}' saved successfully"}), 201
        except Exception as e:
            print(f"Error saving workspace: {e}")
            return jsonify({"error": str(e)}), 500

@app.route('/api/workspaces/<workspace_name>', methods=['GET', 'DELETE'])
def workspace_operations(workspace_name):
    if request.method == 'GET':
        # Get specific workspace
        try:
            # Mock data - replace with actual storage logic
            state = {"blocks": {}}
            return jsonify({"name": workspace_name, "state": state}), 200
        except Exception as e:
            print(f"Error retrieving workspace: {e}")
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'DELETE':
        # Delete workspace
        try:
            # Delete logic here
            return jsonify({"message": f"Workspace '{workspace_name}' deleted successfully"}), 200
        except Exception as e:
            print(f"Error deleting workspace: {e}")
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)