import Blockly from 'blockly';

// PyQUBO Variable Block - Enhanced with all variable types
Blockly.Blocks['pyqubo_variable'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_variable",
      "message0": "Create %1 variable %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TYPE",
          "options": [
            ["Binary", "Binary"],
            ["Spin", "Spin"], 
            ["Integer", "Integer"]
          ]
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": ""
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Define a PyQUBO variable",
      "helpUrl": ""
    });
  }
};

// Modified Array Variable Block to properly handle complex shapes
Blockly.Blocks['pyqubo_array_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create Array")
        .appendField(new Blockly.FieldTextInput(""), "NAME");
    this.appendDummyInput()
        .appendField("shape:");
    this.appendValueInput("SHAPE")
        .setCheck(["Array", "Number"]);  // Accept both array and number inputs
    this.appendDummyInput()
        .appendField("vartype:")
        .appendField(new Blockly.FieldDropdown([
            ["Binary", "Binary"],
            ["Spin", "Spin"]
        ]), "VARTYPE");
    this.setInputsInline(true);  // This makes the block more compact
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Create an array variable for PyQUBO with sequential numbering");
  }
};

// New Array Shape Input Block for 2D arrays
Blockly.Blocks['array_shape_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("[")
        .appendField(new Blockly.FieldNumber(3, 1, 100), "ROWS")
        .appendField(",")
        .appendField(new Blockly.FieldNumber(3, 1, 100), "COLS")
        .appendField("]");
    this.setOutput(true, "Array");
    this.setColour(230);
    this.setTooltip("Define a 2D array shape with rows and columns");
  }
};

// PyQUBO Constraint Block
Blockly.Blocks['pyqubo_constraint'] = {
  init: function() {
    this.appendValueInput("LHS")
        .setCheck(["String", "Number", "Boolean"])
        .appendField("Add constraint:");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
            ["=", "="],
            ["<=", "<="],
            [">=", ">="],
            ["!=", "!="]
        ]), "OPERATOR");
    this.appendValueInput("RHS")
        .setCheck(["String", "Number", "Boolean"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Add a constraint to the QUBO model");
  }
};

// PyQUBO Objective Block
Blockly.Blocks['pyqubo_objective'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set objective to")
        .appendField(new Blockly.FieldDropdown([
            ["maximize", "maximize"],
            ["minimize", "minimize"]
        ]), "GOAL");
    this.appendValueInput("EXPRESSION")
        .setCheck(["String", "Number", "Boolean"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Define the objective function to optimize");
  }
};

// PyQUBO Expression Block
Blockly.Blocks['pyqubo_expression'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_expression",
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "LEFT",
          "check": ["String", "Number", "Boolean", "Variable"]
        },
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            ["+", "+"],
            ["-", "-"],
            ["*", "*"],
            ["/", "/"],
            ["^", "**"]
          ]
        },
        {
          "type": "input_value",
          "name": "RIGHT",
          "check": ["String", "Number", "Boolean", "Variable"]
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Create a mathematical expression",
      "helpUrl": ""
    });
  }
};

// Variable Reference Block
Blockly.Blocks['pyqubo_var_reference'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_var_reference",
      "message0": "variable %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": ""
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Reference a variable in an expression",
      "helpUrl": ""
    });
  }
};

// Updated Array Reference Block
Blockly.Blocks['pyqubo_array_reference'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_array_reference",
      "message0": "array %1 [ %2 ]",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": ""
        },
        {
          "type": "input_value",
          "name": "INDEX",
          "check": "Number"
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Reference an array element in an expression",
      "helpUrl": ""
    });
  }
};

// Sum of Array Elements Block
Blockly.Blocks['pyqubo_array_sum'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_array_sum",
      "message0": "sum of array %1 from %2 to %3",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": ""
        },
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number"
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Calculate the sum of array elements",
      "helpUrl": ""
    });
  }
};

// PyQUBO Model Function - The main container for a QUBO model
Blockly.Blocks['pyqubo_model'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_model",
      "message0": "QUBO Model %1 For function: %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": "createQuboForSingleMove"
        }
      ],
      "message1": "Variables %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "VARIABLES",
          "check": null
        }
      ],
      "message2": "Constraints %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "CONSTRAINTS",
          "check": null
        }
      ],
      "message3": "Objective %1",
      "args3": [
        {
          "type": "input_statement",
          "name": "OBJECTIVE",
          "check": null
        }
      ],
      "message4": "Return %1",
      "args4": [
        {
          "type": "input_statement",
          "name": "RETURN",
          "check": null
        }
      ],
      "colour": 230,
      "tooltip": "Create a complete QUBO model",
      "helpUrl": ""
    });
  }
};

// This keeps backward compatibility with the original PyQUBO function block
Blockly.Blocks['pyqubo_function'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_function",
      "message0": "Define function %1 with parameter %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": ""
        },
        {
          "type": "input_value",
          "name": "PARAM"
        }
      ],
      "message1": "Variables, Constraints, and Objective %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "BODY"
        }
      ],
      "colour": 230,
      "tooltip": "Define a function that returns a PyQUBO model",
      "helpUrl": ""
    });
  }
};

// QUBO Result Display Block
Blockly.Blocks['pyqubo_result_display'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_result_display",
      "message0": "Display QUBO results",
      "colour": 230,
      "tooltip": "Display the results of the QUBO computation showing the optimal solution",
      "helpUrl": "",
      "previousStatement": null,
      "nextStatement": null
    });
  }
};

// Create a PyQUBO Return Expression Block
Blockly.Blocks['pyqubo_return_expression'] = {
  init: function() {
    this.appendValueInput("EXPRESSION")
        .setCheck(["String", "Number", "Boolean"])
        .appendField("Set return expression to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Define what values to return from the quantum solution");
  }
};

// Complex Expression Block
Blockly.Blocks['pyqubo_complex_expression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Expression:");
    this.appendValueInput("EXPRESSION")
        .setCheck(["String", "Number"]);
    this.setOutput(true, ["String", "Number"]);
    this.setColour(230);
    this.setTooltip("Enter a complex mathematical expression");
    this.setHelpUrl("");
  }
};

// Power/Exponent Block
Blockly.Blocks['pyqubo_power'] = {
  init: function() {
    this.appendValueInput("BASE")
        .setCheck(["String", "Number"]);
    this.appendValueInput("EXPONENT")
        .setCheck("Number")
        .appendField("^");
    this.setInputsInline(true);
    this.setOutput(true, ["String", "Number"]);
    this.setColour(230);
    this.setTooltip("Raise a value to a power");
    this.setHelpUrl("");
  }
};

// Integer Variable Block
Blockly.Blocks['pyqubo_integer_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create Integer variable")
        .appendField(new Blockly.FieldTextInput(""), "NAME")
        .appendField("range")
        .appendField(new Blockly.FieldNumber(0), "LOWER")
        .appendField("to")
        .appendField(new Blockly.FieldNumber(10), "UPPER");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Create an integer variable with a specific range");
  }
};

// Board Cell Value Block
Blockly.Blocks['board_cell_value'] = {
  init: function() {
    this.appendValueInput("INDEX")
        .setCheck("Number")
        .appendField("board[");
    this.appendDummyInput()
        .appendField("]");
    this.setInputsInline(true);
    this.setOutput(true, ["String", "Number"]);
    this.setColour(245);
    this.setTooltip("Get the value of a cell on the board");
    this.setHelpUrl("");
  }
};

// Board Cell Condition Block
Blockly.Blocks['board_cell_condition'] = {
  init: function() {
    this.appendValueInput("INDEX")
        .setCheck("Number")
        .appendField("board[");
    this.appendDummyInput()
        .appendField("] is");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ["empty", "''"], 
          ["X", "'X'"], 
          ["O", "'O'"]
        ]), "CONDITION");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(245);
    this.setTooltip("Check if a board cell matches a condition");
    this.setHelpUrl("");
  }
};

// Board is empty count block
Blockly.Blocks['board_empty_count'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("count of empty cells");
    this.setOutput(true, "Number");
    this.setColour(245);
    this.setTooltip("Counts how many empty cells are on the board");
    this.setHelpUrl("");
  }
};

// Raw text block for expressions without quotes
Blockly.Blocks['raw_text'] = {
  init: function() {
    this.jsonInit({
      "type": "raw_text",
      "message0": "raw text %1",
      "args0": [
        {
          "type": "field_input",
          "name": "TEXT",
          "text": "" 
        }
      ],
      "output": ["String", "Number"],
      "colour": 160,
      "tooltip": "Text without quotes for expressions",
      "helpUrl": ""
    });
  }
};

// Improved Empty Cell Variable Block - Creates variables only for empty cells
Blockly.Blocks['pyqubo_empty_cell_variables'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create variables for all empty cells");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Creates Binary variables only for empty cells on the board");
    this.setHelpUrl("");
  }
};

// One-Move Constraint Block - Ensures exactly one move is made
Blockly.Blocks['pyqubo_one_move_constraint'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Add constraint: exactly one move");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Adds a constraint ensuring exactly one variable is set to 1");
    this.setHelpUrl("");
  }
};

// Strategic Weights Block - Sets weights based on strategic value
Blockly.Blocks['pyqubo_strategic_weights'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set strategic weights");
    this.appendValueInput("CENTER_WEIGHT")
        .setCheck("Number")
        .appendField("Center weight:");
    this.appendValueInput("CORNER_WEIGHT")
        .setCheck("Number")
        .appendField("Corner weight:");
    this.appendValueInput("EDGE_WEIGHT")
        .setCheck("Number")
        .appendField("Edge weight:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Sets weights based on strategic value of board positions");
    this.setHelpUrl("");
  }
};

// Winning Move Detection Block - Prioritizes winning and blocking moves
Blockly.Blocks['pyqubo_winning_move_detection'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Add winning move detection");
    this.appendValueInput("WIN_WEIGHT")
        .setCheck("Number")
        .appendField("Winning move weight:");
    this.appendValueInput("BLOCK_WEIGHT")
        .setCheck("Number")
        .appendField("Blocking move weight:");
    this.appendValueInput("SETUP_WEIGHT")
        .setCheck("Number")
        .appendField("Setup move weight:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Detects and prioritizes winning and blocking moves");
    this.setHelpUrl("");
  }
};

// Default Return Expression Block - Creates a standard return expression
Blockly.Blocks['pyqubo_default_return'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set default return expression");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Creates a return expression mapping variables to their indices");
    this.setHelpUrl("");
  }
};

export default {
  blocks: [
    'pyqubo_variable',
    'pyqubo_array_variable',
    'array_shape_input',
    'pyqubo_constraint',
    'pyqubo_objective',
    'pyqubo_expression',
    'pyqubo_var_reference',
    'pyqubo_array_reference',
    'pyqubo_array_sum',
    'pyqubo_model',
    'pyqubo_function',
    'pyqubo_result_display',
    'raw_text',
    'pyqubo_return_expression',
    'pyqubo_complex_expression',
    'pyqubo_power',
    'pyqubo_integer_variable',
    'board_cell_value',
    'board_cell_condition',
    'board_empty_count',
    'pyqubo_empty_cell_variables',
    'pyqubo_one_move_constraint',
    'pyqubo_strategic_weights',
    'pyqubo_winning_move_detection',
    'pyqubo_default_return'
  ]
};