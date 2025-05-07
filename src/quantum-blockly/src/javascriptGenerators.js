import { javascriptGenerator } from 'blockly/javascript';
import * as javascript from 'blockly/javascript';
import './javascriptGenerators';  // Ensures JavaScript generator is included


javascriptGenerator.scrub_ = function (block, code, thisOnly) {
    // Check if the block is of type 'key_pair' or 'dictionary'
    if (block.type === 'key_pair' || block.type === 'dictionary' || block.type === 'key_block' || block.type === 'value_block') {
        var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        if (nextBlock && !thisOnly) {
            return code + ',\n' + javascriptGenerator.blockToCode(nextBlock);
        }
        return code;
    }
    // For other blocks, apply default scrubbing logic
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var codeNext = nextBlock ? javascriptGenerator.blockToCode(nextBlock) : '';
    if (!thisOnly) {
        if (codeNext) {
            codeNext = '\n' + codeNext;
        }
    }
    return code + codeNext;
};

javascriptGenerator.forBlock['key_pair'] = function (block, generator) {
    var key1 = generator.valueToCode(block, 'KEY1', javascript.Order.ATOMIC);
    var key2 = generator.valueToCode(block, 'KEY2', javascript.Order.ATOMIC);
    var code = "`${" + key1 + "},${" + key2 + "}`";
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['for_loop'] = function (block, generator) {
    var variable_var = block.getField('VAR').getText();
    var value_from = generator.valueToCode(block, 'FROM', javascript.Order.ATOMIC) || '0';
    var value_to = generator.valueToCode(block, 'TO', javascript.Order.ATOMIC) || '10';
    var value_step = generator.valueToCode(block, 'STEP', javascript.Order.ATOMIC) || '1';
    var statements_do = generator.statementToCode(block, 'DO');

    // Change the conditional operator from <= to <
    var code = 'for (' + variable_var + ' = ' + value_from + '; ' + variable_var +
        ' < ' + value_to + '; ' + variable_var + ' += ' + value_step + ') {\n' +
        statements_do + '\n}\n';
    return code;
};

javascriptGenerator.forBlock['check_index'] = function (block, generator) {
    var index = generator.valueToCode(block, 'INDEX', javascript.Order.ATOMIC);
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Generate JavaScript code
    var code = 'board[' + index + '] === ' + value;
    return [code, javascript.Order.NONE];
};

javascriptGenerator.forBlock['board_length'] = function (block) {
    var code = 'board.length';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['board'] = function (block) {
    var code = 'board';
    return [code, javascript.Order.ATOMIC];
};

javascript.javascriptGenerator.forBlock['update_dict'] = function (block, generator) {
    var name = block.getField('NAME').getText();
    var key = generator.valueToCode(block, 'KEY', javascript.Order.ATOMIC);
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // TODO: Assemble javascript into code variable.
    var code = name + '[' + key + '] = ' + value + ';\n';
    return code;
};

javascriptGenerator.forBlock['key_block'] = function (block, generator) {
    var key = block.getFieldValue('KEY');
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Assemble JavaScript code.
    var code = '"' + key + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['const_block'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Assemble JavaScript code.
    var code = 'const ' + name + ' = ' + value + ';\n';
    return code;
};

javascriptGenerator.forBlock['value_block'] = function (block) {
    var value = block.getFieldValue('VALUE');
    var code = 'board[' + value + ']';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['quad_pair'] = function (block) {
    var var1 = block.getFieldValue('VAR_1');
    var var2 = block.getFieldValue('VAR_2');
    var value = block.getFieldValue('MEMBER_VALUE');
    var name = var1 + ',' + var2;
    var code = '"' + name + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['key_value'] = function (block) {
    var name = block.getFieldValue('MEMBER_NAME');
    var value = block.getFieldValue('MEMBER_VALUE');
    var code = '"' + name + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['dictionary'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var statementMembers =
        generator.statementToCode(block, 'MEMBERS');
    var code = `${name} = {\n${statementMembers}\n} `;
    return code;
};

javascriptGenerator.forBlock['dictionary_block'] = function (block, generator) {
    var code = '{}';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['merge_dict'] = function (block, generator) {
    var statementMembers =
        generator.statementToCode(block, 'MEMBERS');
    var code = '"{\n' + statementMembers + '\n}"';
    return code;
};

javascriptGenerator.forBlock['quad_dictionary'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var key1_p1 = block.getFieldValue('KEY1_P1');
    var key1_p2 = block.getFieldValue('KEY1_P2');
    var val1 = block.getFieldValue('VAL1');
    var key2_p1 = block.getFieldValue('KEY2_P1');
    var key2_p2 = block.getFieldValue('KEY2_P2');
    var val2 = block.getFieldValue('VAL2');
    var key3_p1 = block.getFieldValue('KEY3_P1');
    var key3_p2 = block.getFieldValue('KEY3_P2');
    var val3 = block.getFieldValue('VAL3');
    // TODO: Assemble javascript into code variable.
    var code = name + ' = {"' + key1_p1 + ',' + key1_p2 + '": ' + val1 + ', "' + key2_p1 + ',' + key2_p2 + '": ' + val2 + ', "' + key3_p1 + ',' + key3_p2 + '": ' + val3 + '}\n';
    return code;
};

javascriptGenerator.forBlock['update_quad_dict'] = function (block) {
    var name = block.getFieldValue('NAME');
    var key = block.getFieldValue('KEY');
    var key2 = block.getFieldValue('KEY2');
    var val = block.getFieldValue('VALUE');
    // TODO: Assemble javascript into code variable.
    var code = name + '.update({"' + key + ',' + key2 + '": ' + val + '})\n'
    return code;
};

// Flexible generator for pyqubo_array_variable to create sequential variable names
javascriptGenerator.forBlock['pyqubo_array_variable'] = function(block) {
  const varName = block.getFieldValue('NAME');
  const vartype = block.getFieldValue('VARTYPE');
  
  // Try to get shape from connected block first
  let shapeInput = javascriptGenerator.valueToCode(block, 'SHAPE', javascriptGenerator.ORDER_ATOMIC);
  
  let code = '';
  
  // Check if shapeInput is a 2D array format
  if (shapeInput && shapeInput.startsWith('[') && shapeInput.includes(',')) {
    try {
      // Parse the dimensions from the input
      const dimensions = JSON.parse(shapeInput);
      if (Array.isArray(dimensions) && dimensions.length === 2) {
        const rows = dimensions[0];
        const cols = dimensions[1];
        
        // Create variables with sequential naming (x0, x1, x2, etc.)
        let totalCount = 0;
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            code += `variables["${varName}${totalCount}"] = { "type": "${vartype}" };\n`;
            totalCount++;
          }
        }
        return code;
      }
    } catch (e) {
      console.error("Failed to parse array shape:", e);
    }
  }
  
  // Default to 1D array if no valid 2D shape is provided
  // If shapeInput is not a valid number, default to 10
  const size = parseInt(shapeInput) || 10;
  for (let i = 0; i < size; i++) {
    code += `variables["${varName}${i}"] = { "type": "${vartype}" };\n`;
  }
  
  return code;
};

// New block for PyQUBO variable definition
javascriptGenerator.forBlock['pyqubo_variable'] = function (block, generator) {
  var type = block.getFieldValue('TYPE');
  var name = block.getFieldValue('NAME');
  
  var code = `variables["${name}"] = { "type": "${type}" };\n`;
  if (type === 'Array') {
      code += `variables["${name}"]["size"] = 10;\n`; // Default size
  }
  
  return code;
};

// New block for PyQUBO constraint
javascriptGenerator.forBlock['pyqubo_constraint'] = function(block, generator) {
  var lhs = generator.valueToCode(block, 'LHS', javascriptGenerator.ORDER_ATOMIC) || '';
  var operator = block.getFieldValue('OPERATOR');
  var rhs = generator.valueToCode(block, 'RHS', javascriptGenerator.ORDER_ATOMIC) || '0';
  
  // Remove any quotes around the LHS to ensure it's properly formatted
  lhs = lhs.replace(/^["'](.*)["']$/, '$1');
  
  // Format the constraint correctly
  var code = `constraints.push({
    "lhs": "${lhs}",
    "comparison": "${operator}",
    "rhs": ${rhs}
  });\n`;
  
  return code;
};

javascriptGenerator.forBlock['pyqubo_objective'] = function(block, generator) {
  var goal = block.getFieldValue('GOAL');
  var expression = generator.valueToCode(block, 'EXPRESSION', javascriptGenerator.ORDER_ATOMIC) || '0';
  
  // Remove any quotes around the expression
  expression = expression.replace(/^["'](.*)["']$/, '$1');
  
  // For maximize, negate each term individually
  if (goal === 'maximize') {
    // Split by + and handle each term
    let terms = expression.split('+').map(term => {
      term = term.trim();
      if (term.startsWith('-')) {
        // If term already has a negative, remove it
        return term.substring(1).trim();
      } else {
        // Add negative to the term
        return '-' + term;
      }
    });
    
    // Join back with plus signs
    expression = terms.join(' + ');
  }
  
  // Set the objective without wrapping in parentheses
  var code = `objective = "${expression}";\n`;
  
  return code;
};

// Improved function block generator
javascriptGenerator.forBlock['function'] = function (block, generator) {
  var name = block.getFieldValue('NAME').replace(/\s/g, '_');
  var param = generator.valueToCode(block, 'PARAM', javascript.Order.ATOMIC) || '{}';
  var body = generator.statementToCode(block, 'BODY') || '';
  var linear = generator.valueToCode(block, 'LINEAR', javascript.Order.ATOMIC) || '{}';
  var quadratic = generator.valueToCode(block, 'QUADRATIC', javascript.Order.ATOMIC) || '{}';
  
  // Ensure linear and quadratic are valid objects
  linear = linear.trim() === '' ? '{}' : linear;
  quadratic = quadratic.trim() === '' ? '{}' : quadratic;
  
  var code = `function ${name}(${param}) {\n${body}  return {\n    'linear': ${linear},\n    'quadratic': ${quadratic}\n  };\n}`;
  return code;
};

// Add these generators to your javascriptGenerators.js file

javascriptGenerator.forBlock['init_dictionaries'] = function(block) {
  return 'const linear = {};\nconst quadratic = {};\n';
};

javascriptGenerator.forBlock['set_linear_weight'] = function(block) {
  const variable = javascriptGenerator.valueToCode(block, 'VARIABLE', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const weight = javascriptGenerator.valueToCode(block, 'WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '0';
  return `linear[${variable}] = ${weight};\n`;
};

javascriptGenerator.forBlock['set_quadratic_weight'] = function(block) {
  const variable1 = javascriptGenerator.valueToCode(block, 'VARIABLE1', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const variable2 = javascriptGenerator.valueToCode(block, 'VARIABLE2', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const weight = javascriptGenerator.valueToCode(block, 'WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '0';
  return `quadratic[\`\${${variable1}},\${${variable2}}\`] = ${weight};\n`;
};

javascriptGenerator.forBlock['return_dictionaries'] = function(block) {
  return 'return { "linear": linear, "quadratic": quadratic };\n';
};

// Expression Block Generator
javascriptGenerator.forBlock['pyqubo_expression'] = function(block) {
  const left = javascriptGenerator.valueToCode(block, 'LEFT', javascriptGenerator.ORDER_ATOMIC);
  const operator = block.getFieldValue('OPERATOR');
  const right = javascriptGenerator.valueToCode(block, 'RIGHT', javascriptGenerator.ORDER_ATOMIC);
  
  const code = `(${left} ${operator} ${right})`;
  return [code, javascriptGenerator.ORDER_ATOMIC];
};

// Variable Reference Block Generator
javascriptGenerator.forBlock['pyqubo_var_reference'] = function(block) {
  const name = block.getFieldValue('NAME');
  return [name, javascriptGenerator.ORDER_ATOMIC];
};

// Array Reference Block Generator
javascriptGenerator.forBlock['pyqubo_array_reference'] = function(block) {
  const name = block.getFieldValue('NAME');
  const index = javascriptGenerator.valueToCode(block, 'INDEX', javascriptGenerator.ORDER_ATOMIC);
  
  return [`${name}[${index}]`, javascriptGenerator.ORDER_MEMBER];
};

// Ensure the array_shape_input generator is properly defined
javascriptGenerator.forBlock['array_shape_input'] = function(block) {
  const rows = block.getFieldValue('ROWS');
  const cols = block.getFieldValue('COLS');
  
  // Return a properly formatted array as a string
  return [`[${rows}, ${cols}]`, javascriptGenerator.ORDER_ATOMIC];
};

// Array Sum Block Generator
javascriptGenerator.forBlock['pyqubo_array_sum'] = function(block) {
  const name = block.getFieldValue('NAME');
  const from = javascriptGenerator.valueToCode(block, 'FROM', javascriptGenerator.ORDER_ATOMIC) || '0';
  const to = javascriptGenerator.valueToCode(block, 'TO', javascriptGenerator.ORDER_ATOMIC) || '0';
  
  // Create a string representation of the sum
  let sumExpr = '(';
  sumExpr += `${name}[${from}]`;
  sumExpr += ` + ... + ${name}[${to}]`;
  sumExpr += ')';
  
  return [sumExpr, javascriptGenerator.ORDER_ATOMIC];
};

// QUBO Model Block Generator
javascriptGenerator.forBlock['pyqubo_model'] = function(block) {
  const functionName = block.getFieldValue('NAME');
  const variables = javascriptGenerator.statementToCode(block, 'VARIABLES');
  const constraints = javascriptGenerator.statementToCode(block, 'CONSTRAINTS');
  const objective = javascriptGenerator.statementToCode(block, 'OBJECTIVE');
  const returnExpression = javascriptGenerator.statementToCode(block, 'RETURN');
  
  const code = `
function ${functionName}(board) {
  // Initialize collections for PyQUBO model
  const variables = {};
  const constraints = [];
  let objective = "0";
  let returnExpr = "0"; 
  
  // Define variables
  ${variables}
  
  // Add constraints
  ${constraints}
  
  // Set objective function
  ${objective}
  
  // Set return expression
  ${returnExpression}
  
  // Return the complete QUBO model
  return {
    "variables": variables,
    "Constraints": constraints,
    "Objective": objective,
    "Return": returnExpr // Always include Return field
  };
}`;
  
  return code;
};

// Update the raw_text generator to be more compatible
javascriptGenerator.forBlock['raw_text'] = function(block) {
  const text = block.getFieldValue('TEXT');

  // Return raw text without additional processing
  return [text, javascriptGenerator.ORDER_ATOMIC];
};

// Generator for the QUBO result display block
javascriptGenerator.forBlock['pyqubo_result_display'] = function(block) {
  // This block now only adds a marker comment in the generated code
  // The actual display logic will be handled in BlocklyComponent.js
  const code = `
  // Display QUBO results placeholder
  // Actual display is handled in the BlocklyComponent
  `;
  
  return code;
};

// Generator for return expression
javascriptGenerator.forBlock['pyqubo_return_expression'] = function(block) {
  var expression = javascriptGenerator.valueToCode(block, 'EXPRESSION', javascriptGenerator.ORDER_ATOMIC) || '0*x0';
  
  // Remove any quotes around the expression
  expression = expression.replace(/^["'](.*)["']$/, '$1');
  
  var code = `returnExpr = "${expression}";\n`;
  return code;
};

// Generator for complex expressions
javascriptGenerator.forBlock['pyqubo_complex_expression'] = function(block) {
  const expression = javascriptGenerator.valueToCode(block, 'EXPRESSION', javascriptGenerator.ORDER_ATOMIC) || '0';
  return [expression, javascriptGenerator.ORDER_ATOMIC];
};

// Generator for power/exponent
javascriptGenerator.forBlock['pyqubo_power'] = function(block) {
  const base = javascriptGenerator.valueToCode(block, 'BASE', javascriptGenerator.ORDER_ATOMIC);
  const exponent = javascriptGenerator.valueToCode(block, 'EXPONENT', javascriptGenerator.ORDER_ATOMIC);
  
  return [`(${base}) ** (${exponent})`, javascriptGenerator.ORDER_ATOMIC];
};

// Generator for integer variables
javascriptGenerator.forBlock['pyqubo_integer_variable'] = function(block) {
  const name = block.getFieldValue('NAME');
  const lower = block.getFieldValue('LOWER');
  const upper = block.getFieldValue('UPPER');
  
  return `variables["${name}"] = { 
    "type": "Unary", 
    "lower": ${lower}, 
    "upper": ${upper} 
  };\n`;
};

// Generator for board cell value
javascriptGenerator.forBlock['board_cell_value'] = function(block) {
  const index = javascriptGenerator.valueToCode(block, 'INDEX', javascriptGenerator.ORDER_ATOMIC) || '0';
  return [`board[${index}]`, javascriptGenerator.ORDER_MEMBER];
};

// Generator for board cell condition
javascriptGenerator.forBlock['board_cell_condition'] = function(block) {
  const index = javascriptGenerator.valueToCode(block, 'INDEX', javascriptGenerator.ORDER_ATOMIC) || '0';
  const condition = block.getFieldValue('CONDITION');
  return [`board[${index}] === ${condition}`, javascriptGenerator.ORDER_EQUALITY];
};

// Generator for board empty count
javascriptGenerator.forBlock['board_empty_count'] = function(block) {
  return [`board.filter(cell => cell === '').length`, javascriptGenerator.ORDER_FUNCTION_CALL];
};

// Generator for empty cell variables
javascriptGenerator.forBlock['pyqubo_empty_cell_variables'] = function(block) {
  const code = `
// Create variables only for empty cells
for (let i = 0; i < board.length; i++) {
  if (board[i] === '') {
    variables[\`x\${i}\`] = { "type": "Binary" };
  }
}

// If no empty cells, add a dummy variable to prevent errors
if (Object.keys(variables).length === 0) {
  variables["x0"] = { "type": "Binary" };
}
`;
  return code;
};

// Generator for one move constraint
javascriptGenerator.forBlock['pyqubo_one_move_constraint'] = function(block) {
  const code = `
// Get all variable names
const varNames = Object.keys(variables);

// Add constraint to ensure exactly one move is made
if (varNames.length > 0) {
  constraints.push({
    "lhs": varNames.join(" + "),
    "comparison": "=",
    "rhs": 1
  });
}
`;
  return code;
};

// Generator for strategic weights
javascriptGenerator.forBlock['pyqubo_strategic_weights'] = function(block) {
  const centerWeight = javascriptGenerator.valueToCode(block, 'CENTER_WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '9';
  const cornerWeight = javascriptGenerator.valueToCode(block, 'CORNER_WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '7';
  const edgeWeight = javascriptGenerator.valueToCode(block, 'EDGE_WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '5';
  
  const code = `
// Initialize objective terms array
let objectiveTerms = [];

// Give higher weight to center position (4)
if (board[4] === '') {
  objectiveTerms.push(\`${centerWeight} * x4\`);
}

// Give medium weight to corners (0, 2, 6, 8)
const corners = [0, 2, 6, 8];
corners.forEach(corner => {
  if (board[corner] === '') {
    objectiveTerms.push(\`${cornerWeight} * x\${corner}\`);
  }
});

// Give lower weight to edges (1, 3, 5, 7)
const edges = [1, 3, 5, 7];
edges.forEach(edge => {
  if (board[edge] === '') {
    objectiveTerms.push(\`${edgeWeight} * x\${edge}\`);
  }
});

// Combine all terms for the objective function
if (objectiveTerms.length > 0) {
  objective = objectiveTerms.join(" + ");
}
`;
return `
const CENTER_WEIGHT = ${centerWeight};
const CORNER_WEIGHT = ${cornerWeight};
const EDGE_WEIGHT = ${edgeWeight};
`;
};

// Generator for winning move detection
javascriptGenerator.forBlock['pyqubo_winning_move_detection'] = function(block) {
  const winWeight = javascriptGenerator.valueToCode(block, 'WIN_WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '10';
  const blockWeight = javascriptGenerator.valueToCode(block, 'BLOCK_WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '8';
  const setupWeight = javascriptGenerator.valueToCode(block, 'SETUP_WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '1.5';
  
  const code = `
// Define all possible winning lines
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Check each line for winning or blocking opportunities
lines.forEach(line => {
  // Count how many of each type in the line
  let playerCells = 0;
  let opponentCells = 0;
  let emptyCells = [];
  
  line.forEach(idx => {
    if (board[idx] === 'X') playerCells++;
    else if (board[idx] === 'O') opponentCells++;
    else if (board[idx] === '') emptyCells.push(idx);
  });
  
  // Winning move: if we have 2 in a row and an empty cell
  if (playerCells === 2 && emptyCells.length === 1) {
    objectiveTerms.push(\`${winWeight} * x\${emptyCells[0]}\`);
  }
  // Blocking move: if opponent has 2 in a row and we can block
  else if (opponentCells === 2 && emptyCells.length === 1) {
    objectiveTerms.push(\`${blockWeight} * x\${emptyCells[0]}\`);
  }
  // Opportunity: if we have 1 in a row and 2 empty cells
  else if (playerCells === 1 && emptyCells.length === 2) {
    emptyCells.forEach(cell => {
      objectiveTerms.push(\`${setupWeight} * x\${cell}\`);
    });
  }
});

// Update the objective function if new terms were added
if (objectiveTerms.length > 0) {
  objective = objectiveTerms.join(" + ");
}
`;
return `
const WINNING_MOVE_WEIGHT = ${winWeight};
const BLOCKING_MOVE_WEIGHT = ${blockWeight};
const SETUP_MOVE_WEIGHT = ${setupWeight};
`;
};

// Generator for default return expression
javascriptGenerator.forBlock['pyqubo_default_return'] = function(block) {
  const code = `
// Build the return expression to map variables to their indices
const returnTerms = [];
Object.keys(variables).forEach(varName => {
  // Extract the index from the variable name (x0, x1, etc.)
  const index = varName.replace('x', '');
  returnTerms.push(\`\${index} * \${varName}\`);
});

if (returnTerms.length > 0) {
  returnExpr = returnTerms.join(" + ");
}
`;
  return code;
};