import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyqubo import Binary, Spin, UnaryEncInteger
from neal import SimulatedAnnealingSampler  

import json

app = Flask(__name__)
CORS(app)

WORKSPACE_DIR = "workspaces"
os.makedirs(WORKSPACE_DIR, exist_ok=True)

def parse_variables(variable_data):
    expressions = {}
    variables = {}

    for var_name, var_info in variable_data.items():
        var_type = var_info.get("type")

        if var_type == "Binary":
            expr = Binary(var_name)
            variables[var_name] = expr
            expressions[var_name] = expr

        elif var_type == "Spin":
            expr = Spin(var_name)
            variables[var_name] = expr
            expressions[var_name] = expr

        elif var_type == "Array":
            if "shape" not in var_info:
                return jsonify({"error": f"Array variable '{var_name}' must include a 'shape' field."}), 400

            shape = var_info["shape"]
            vartype = var_info.get("vartype", "Binary").lower()
            constructor = Spin if vartype == "spin" else Binary

            if isinstance(shape, int):
                for i in range(shape):
                    label = f"{var_name}_{i}"
                    expr = constructor(label)
                    variables[label] = expr
                    expressions[label] = expr

            elif isinstance(shape, (list, tuple)) and len(shape) == 2:
                rows, cols = shape
                for i in range(rows):
                    for j in range(cols):
                        label = f"{var_name}_{i}_{j}"
                        expr = constructor(label)
                        variables[label] = expr
                        expressions[label] = expr
            else:
                return jsonify({"error": f"Invalid array shape for '{var_name}': {shape}"}), 400

        elif var_type == "Unary":
            if "lower" not in var_info or "upper" not in var_info:
                return jsonify({"error": f"Unary variable '{var_name}' must have both 'lower' and 'upper' specified."}), 400

            lower = var_info["lower"]
            upper = var_info["upper"]
            encoder = UnaryEncInteger(var_name, (lower, upper))
            variables[var_name] = encoder

            n = upper - lower + 1
            bits = []
            for i in range(n):
                label = f"{var_name}[{i}]"
                bit = Binary(label)
                expressions[label] = bit
                bits.append(bit)

            expressions[var_name] = sum(bits)


        else:
            return jsonify({"error": f"Unsupported variable type: {var_type}"}), 400

    return expressions, variables

def parse_constraints(constraint_data, expressions):
    constraints = []

    for constraint in constraint_data:
        lhs_expr = constraint.get("lhs", "0")
        comparison = constraint.get("comparison", "=")
        rhs = constraint.get("rhs", 0)

        try:
            lhs = eval(lhs_expr, {}, expressions)

            if comparison == "=":
                constraints.append(10 * (lhs - rhs) ** 2)
            elif comparison == "<=" or comparison == "≤":
                constraints.append(10 * (lhs - rhs) ** 2)
            elif comparison == ">=" or comparison == "≥":
                constraints.append(10 * (rhs - lhs) ** 2)
            elif comparison == "!=":
                constraints.append(10 * (lhs - rhs) ** 2 * 100)
        except Exception as e:
            return jsonify({"error": f"Invalid constraint expression: {lhs_expr}, {str(e)}"}), 400

     # Enforce unary pattern if needed
    for var_name, expr in expressions.items():
        if '[' not in var_name and any(f"{var_name}[" in key for key in expressions):
            n = sum(1 for key in expressions if key.startswith(f"{var_name}[") and key.endswith(']'))
            for i in range(n - 1):
                a = expressions[f"{var_name}[{i}]"]
                b = expressions[f"{var_name}[{i+1}]"]
                constraints.append(10*(1 - a) * b)
    

    return constraints

def parse_objective(objective_expr, expressions):
    try:
        return eval(objective_expr, {}, expressions)
    except Exception as e:
        return jsonify({"error": f"Invalid objective expression: {objective_expr}, {str(e)}"}), 400

@app.route('/quantum', methods=['POST'])
def calculate():
    def evaluate_return_expression(expr: str, sample: dict):
        try:
            values = {k: int(v) for k, v in sample.items()}

            # Handle unary variable names (e.g., score, chance)
            unary_groups = {}
            for key in values:
                if "[" in key and key.endswith("]"):
                    name = key.split("[")[0]
                    unary_groups.setdefault(name, []).append((int(key[key.index("[")+1:-1]), key))

            # Determine proper unary value by counting leading 1s
            for name, bits in unary_groups.items():
                bits.sort()  # Sort by index
                val = 0
                for _, key in bits:
                    if values[key] == 1:
                        val += 1
                    else:
                        break
                values[name] = val  # Add reconstructed unary value

            # Return both the evaluated result and the complete value map
            result = eval(expr, {}, values)
            return result, values

        except Exception as e:
            return f"Error evaluating return expression: {str(e)}"

    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        # Ensure Return expression is provided
        return_expr = data.get("Return")
        if not return_expr:
            return jsonify({"error": "Missing required 'Return' expression in request."}), 400

        expressions, variables = parse_variables(data.get("variables", {}))
        if isinstance(expressions, tuple):
            return expressions

        constraints = parse_constraints(data.get("Constraints", []), expressions)
        if isinstance(constraints, tuple):
            return constraints

        objective = parse_objective(data.get("Objective", "0"), expressions)
        if isinstance(objective, tuple):
            return objective

        qubo_model = sum(constraints) + objective

        # Add unary variable objects to ensure structure is enforced
        for v in variables.values():
            if isinstance(v, UnaryEncInteger):  
                qubo_model += v

        compiled_qubo = qubo_model.compile()
        qubo, offset = compiled_qubo.to_qubo()
        qubo_str_keys = {str(k): v for k, v in qubo.items()}

        sampler = SimulatedAnnealingSampler()
        response = sampler.sample_qubo(qubo, num_reads=1000)
        best_sample = list(response.samples())[0]

        solution = None
        for key, value in best_sample.items():
            if value == 1:
                solution = key
                break

        # Evaluate and extract substituted variables
        result = evaluate_return_expression(return_expr, best_sample)
        if isinstance(result, str):  # Error string
            return jsonify({"error": result}), 400
        evaluated_return, substituted_values = result

        return jsonify({
            'offset': offset,
            'solution': solution,
            'sample': {k: int(v) for k, v in best_sample.items()},
            'return': evaluated_return,
            'return_expr': return_expr,
            'substituted_values': substituted_values
        }), 200

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8000)
