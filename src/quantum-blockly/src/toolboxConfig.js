export const toolboxConfig = {
  kind: "categoryToolbox",
  contents: [
    // Core Programming Categories
    {
      kind: "category",
      name: "Logic",
      categorystyle: "logic_category",
      contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
        { kind: "block", type: "logic_null" },
        { kind: "block", type: "logic_ternary" }
      ]
    },
    {
      kind: "category",
      name: "Loops",
      categorystyle: "loop_category",
      contents: [
        {
          kind: "block",
          type: "controls_repeat_ext",
          inputs: {
            TIMES: {
              shadow: { type: "math_number", fields: { NUM: 10 } }
            }
          }
        },
        { kind: "block", type: "controls_whileUntil" },
        { kind: "block", type: "controls_for" },
        { kind: "block", type: "controls_forEach" },
        { kind: "block", type: "controls_flow_statements" },
        { kind: "block", type: "for_loop" }
      ]
    },
    {
      kind: "category",
      name: "Math",
      categorystyle: "math_category",
      contents: [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_arithmetic" },
        { kind: "block", type: "math_single" },
        { kind: "block", type: "math_trig" },
        { kind: "block", type: "math_constant" },
        { kind: "block", type: "math_number_property" },
        { kind: "block", type: "math_round" },
        { kind: "block", type: "math_on_list" },
        { kind: "block", type: "math_modulo" },
        { kind: "block", type: "math_constrain" },
        { kind: "block", type: "math_random_int" },
        { kind: "block", type: "math_random_float" },
        { kind: "block", type: "math_atan2" }
      ]
    },
    {
      kind: "category",
      name: "Text",
      categorystyle: "text_category",
      contents: [
        { kind: "block", type: "text" },
        { kind: "block", type: "text_multiline" },
        { kind: "block", type: "raw_text" },
        { kind: "block", type: "text_join" },
        { kind: "block", type: "text_append" },
        { kind: "block", type: "text_length" },
        { kind: "block", type: "text_isEmpty" },
        { kind: "block", type: "text_indexOf" },
        { kind: "block", type: "text_charAt" },
        { kind: "block", type: "text_getSubstring" },
        { kind: "block", type: "text_changeCase" },
        { kind: "block", type: "text_trim" },
        { kind: "block", type: "text_count" },
        { kind: "block", type: "text_replace" },
        { kind: "block", type: "text_reverse" },
        { kind: "block", type: "text_print" },
        { kind: "block", type: "text_prompt_ext" }
      ]
    },
    {
      kind: "category",
      name: "Lists",
      categorystyle: "list_category",
      contents: [
        { kind: "block", type: "lists_create_with" },
        { kind: "block", type: "lists_repeat" },
        { kind: "block", type: "lists_length" },
        { kind: "block", type: "lists_isEmpty" },
        { kind: "block", type: "lists_indexOf" },
        { kind: "block", type: "lists_getIndex" },
        { kind: "block", type: "lists_setIndex" },
        { kind: "block", type: "lists_getSublist" },
        { kind: "block", type: "lists_split" },
        { kind: "block", type: "lists_sort" },
        { kind: "block", type: "lists_reverse" }
      ]
    },
    {
      kind: "category",
      name: "Color",
      categorystyle: "colour_category",
      contents: [
        { kind: "block", type: "colour_picker" },
        { kind: "block", type: "colour_random" },
        { kind: "block", type: "colour_rgb" },
        { kind: "block", type: "colour_blend" }
      ]
    },
    { kind: "sep" },
    
    // Variable and Function Categories
    {
      kind: "category",
      name: "Variables",
      categorystyle: "variable_category",
      custom: "VARIABLE"
    },
    {
      kind: "category",
      name: "Functions",
      categorystyle: "procedure_category",
      custom: "PROCEDURE"
    },
    
    // PyQUBO Category - Organized by subcategories
    {
      kind: "category",
      name: "PyQUBO",
      colour: "#4169E1", // Royal Blue
      contents: [
        // --- Model Structure ---
        {
          kind: "label",
          text: "Model Structure"
        },
        // Main model container
        { kind: "block", type: "pyqubo_model" },
        // Result display block
        { 
          kind: "block", 
          type: "pyqubo_result_display" 
        },
        
        // --- Variable Definitions ---
        {
          kind: "label",
          text: "Variable Definitions"
        },
        // Single variable
        { 
          kind: "block", 
          type: "pyqubo_variable"
        },
        // Array variable
        { 
          kind: "block", 
          type: "pyqubo_array_variable"
        },
        // Integer variable
        {
          kind: "block",
          type: "pyqubo_integer_variable"
        },
        // 2D Array shape input block
        { 
          kind: "block", 
          type: "array_shape_input"
        },
        
        // --- Constraints and Objective ---
        {
          kind: "label",
          text: "Constraints & Objective"
        },
        // Constraints
        { 
          kind: "block", 
          type: "pyqubo_constraint"
        },
        // Objective
        { 
          kind: "block", 
          type: "pyqubo_objective"
        },
        // Return Expression
        {
          kind: "block",
          type: "pyqubo_return_expression"
        },
        
        // --- Variable References ---
        {
          kind: "label",
          text: "Variable References"
        },
        // Variable references
        { kind: "block", type: "pyqubo_var_reference" },
        // Array reference blocks
        { kind: "block", type: "pyqubo_array_reference" },
        
        // --- Board State Integration ---
        {
          kind: "label",
          text: "Board State"
        },
        // Board cell value
        { kind: "block", type: "board_cell_value" },
        // Board cell condition
        { kind: "block", type: "board_cell_condition" },
        // Board empty count
        { kind: "block", type: "board_empty_count" },
        
        // --- Smart QUBO Blocks ---
        {
          kind: "label",
          text: "Smart QUBO Blocks"
        },
        // Empty cell variables block
        { 
          kind: "block", 
          type: "pyqubo_empty_cell_variables" 
        },
        // One move constraint block
        { 
          kind: "block", 
          type: "pyqubo_one_move_constraint" 
        },
        // Strategic weights block
        { 
          kind: "block", 
          type: "pyqubo_strategic_weights",
          inputs: {
            CENTER_WEIGHT: {
              shadow: { type: "math_number", fields: { NUM: 9 } }
            },
            CORNER_WEIGHT: {
              shadow: { type: "math_number", fields: { NUM: 7 } }
            },
            EDGE_WEIGHT: {
              shadow: { type: "math_number", fields: { NUM: 5 } }
            }
          }
        },
        // Winning move detection block
        { 
          kind: "block", 
          type: "pyqubo_winning_move_detection",
          inputs: {
            WIN_WEIGHT: {
              shadow: { type: "math_number", fields: { NUM: 10 } }
            },
            BLOCK_WEIGHT: {
              shadow: { type: "math_number", fields: { NUM: 8 } }
            },
            SETUP_WEIGHT: {
              shadow: { type: "math_number", fields: { NUM: 1.5 } }
            }
          }
        },
        // Default return expression block
        { 
          kind: "block", 
          type: "pyqubo_default_return" 
        },
        
        // --- Complex Expressions ---
        {
          kind: "label",
          text: "Complex Expressions"
        },
        // Complex expression block
        { kind: "block", type: "pyqubo_complex_expression" },
        // Power/exponent block
        { kind: "block", type: "pyqubo_power" },
        
        // --- Array Utilities ---
        {
          kind: "label",
          text: "Array Utilities"
        },
        // Array sum
        { kind: "block", type: "pyqubo_array_sum" },
        
        // --- Expression Building ---
        {
          kind: "label",
          text: "Expression Building"
        },
        // Expression building
        { kind: "block", type: "pyqubo_expression" },
        // Raw text for expressions
        { kind: "block", type: "raw_text" }
      ]
    },

    // Saved Blocks Category
    {
      kind: "category",
      name: "Saved Blocks",
      colour: "#FFAB19",
      contents: []
    }
  ]
};  

export default toolboxConfig;