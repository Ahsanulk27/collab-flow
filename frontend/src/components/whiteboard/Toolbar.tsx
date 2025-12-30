import { Tool } from "../../types/whiteboard";
import { Button } from "../ui/button";
import { Pencil, Square, Circle, Type, MousePointer2, Eraser, Undo, Redo, Image } from "lucide-react";

interface ToolbarProps {
  activeTool: Tool;
  setTool: (tool: Tool) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  color: string;
  setColor: (color: string) => void;
  onIconToolClick?: () => void;
}

const COLORS = [
  "#000000", // Black
  "#EF4444", // Red
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#EAB308", // Yellow
  "#A855F7", // Purple
];

export const Toolbar = ({ activeTool, setTool, undo, redo, canUndo, canRedo, color, setColor, onIconToolClick }: ToolbarProps) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg p-2 flex flex-col gap-2 z-10 border items-center">
      <div className="flex gap-2">
        <Button
          variant={activeTool === "select" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTool("select")}
          title="Select"
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "pencil" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTool("pencil")}
          title="Pencil"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "rectangle" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTool("rectangle")}
          title="Rectangle"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "ellipse" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTool("ellipse")}
          title="Ellipse"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "text" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTool("text")}
          title="Text"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "icon" ? "default" : "ghost"}
          size="icon"
          onClick={() => {
            setTool("icon");
            onIconToolClick?.();
          }}
          title="Icon"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "eraser" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTool("eraser")}
          title="Eraser"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <div className="w-px bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2 border-t pt-2 w-full justify-center">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`w-6 h-6 rounded-full border ${color === c ? "ring-2 ring-offset-1 ring-black" : ""}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            title={c}
          />
        ))}
      </div>
    </div>
  );
};
