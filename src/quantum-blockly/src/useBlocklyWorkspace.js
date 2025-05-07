import { useEffect, useRef, useState } from 'react';
import Blockly from 'blockly/core';
import { toolboxConfig } from './toolboxConfig';

export const useBlocklyWorkspace = () => {
  const workspaceRef = useRef(null);
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    if (workspaceRef.current) {
      const newWorkspace = Blockly.inject(workspaceRef.current, {
        toolbox: toolboxConfig,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        }
      });

      setWorkspace(newWorkspace);
    }
  }, []);

  return { workspaceRef, workspace };
};