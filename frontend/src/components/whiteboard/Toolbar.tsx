import { Tool } from "../../types/whiteboard";
import { Button } from "../ui/button";
import { Pencil, Square, Circle, Type, MousePointer2, Eraser } from "lucide-react";

interface ToolbarProps {
  activeTool: Tool;
  setTool: (tool: Tool) => void;
}

export const Toolbar = ({ activeTool, setTool }: ToolbarProps) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg p-2 flex gap-2 z-10 border">
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
        variant={activeTool === "eraser" ? "default" : "ghost"}
        size="icon"
        onClick={() => setTool("eraser")}
        title="Eraser"
      >
        <Eraser className="h-4 w-4" />
      </Button>
    </div>
  );
};
