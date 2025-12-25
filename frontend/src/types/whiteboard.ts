export type Tool = 'select' | 'pencil' | 'rectangle' | 'ellipse' | 'text' | 'eraser';

export interface Shape {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[]; 
  text?: string;    
  fill?: string;
  stroke: string;
  strokeWidth: number;
}
