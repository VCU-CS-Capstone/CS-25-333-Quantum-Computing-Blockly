import Blockly from 'blockly';

// Define a new block for raw text
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
      "output": ["String", "Number"],  // Support both string and number outputs
      "colour": 160,
      "tooltip": "Text without quotes for expressions",
      "helpUrl": ""
    });
  }
};

export default Blockly.Blocks['raw_text'];