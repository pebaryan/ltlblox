import { LTLNode } from "./ltl-evaluator";

export interface FlatBlock {
  node: LTLNode;
  position: [number, number, number];
  color: string;
}

export function flattenFormula(node: LTLNode, x: number, y: number, list: FlatBlock[] = []): FlatBlock[] {
  const colors: Record<string, string> = {
    'PROPOSITION': '#ef4444', 
    'ALWAYS': '#3b82f6',      
    'EVENTUALLY': '#10b981',  
    'NOT': '#f87171',
    'AND': '#f59e0b',
  };

  // 1. Add current node at the current Y level
  list.push({
    node,
    position: [x, y, 0],
    color: colors[node.type] || '#ffffff'
  });

  // 2. Move DOWN for the children
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      // Subtract from Y to build the foundation downwards
      flattenFormula(child, x, y - 1.2, list);
    });
  }

  return list;
}
