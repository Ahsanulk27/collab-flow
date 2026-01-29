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
    <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 bg-white shadow-md rounded-lg p-1.5 sm:p-2 flex flex-col gap-1.5 sm:gap-2 z-10 border items-center max-w-[calc(100vw-1rem)] sm:max-w-none">
      <div className="flex gap-1 sm:gap-2 overflow-x-auto w-full justify-center pb-1 sm:pb-0 scrollbar-thin [&::-webkit-scrollbar]:h-1">
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
