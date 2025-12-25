import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Ellipse, Line, Text } from "react-konva";
import Konva from "konva";
import { Shape, Tool } from "@/types/whiteboard";
import { v4 as uuidv4 } from "uuid";

interface CanvasProps {
  elements: Shape[];
  setElements: (elements: Shape[]) => void;
  tool: Tool;
}

export const Canvas = ({ elements, setElements, tool }: CanvasProps) => {
  const isDrawing = useRef(false);
  const [textArea, setTextArea] = useState<{ x: number; y: number; width: number; height: number; id: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textArea && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [textArea]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "select" || tool === "eraser" || textArea) return;

    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const id = uuidv4();

    const newShape: Shape = {
      id,
      type: tool,
      x: pos.x || 0,
      y: pos.y || 0,
      width: 0,
      height: 0,
      points: tool === "pencil" ? [pos.x || 0, pos.y || 0] : undefined,
      stroke: "#000000",
      strokeWidth: 2,
      text: tool === "text" ? "" : undefined,
    };

    setElements([...elements, newShape]);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || tool === "select" || tool === "eraser") return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    const lastElement = elements[elements.length - 1];
    const index = elements.length - 1;

    if (tool === "pencil") {
        // Append points to the line
        const newPoints = lastElement.points!.concat([point.x || 0, point.y || 0]);
        const newElements = [...elements];
        newElements[index] = { ...lastElement, points: newPoints };
        setElements(newElements);
    } else {
        // Update width/height for shapes
        const newElements = [...elements];
        newElements[index] = {
            ...lastElement,
            width: (point.x || 0) - lastElement.x,
            height: (point.y || 0) - lastElement.y,
        };
        setElements(newElements);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current && tool === "text") {
        const lastElement = elements[elements.length - 1];
        // If width/height is too small, set a default size
        const width = Math.abs(lastElement.width || 0) < 20 ? 100 : lastElement.width;
        const height = Math.abs(lastElement.height || 0) < 20 ? 50 : lastElement.height;
        
        setTextArea({
            x: lastElement.x,
            y: lastElement.y,
            width: width || 100,
            height: height || 50,
            id: lastElement.id
        });
    }
    isDrawing.current = false;
  };

  const handleShapeClick = (id: string) => {
      if (tool === "eraser") {
          setElements(elements.filter(el => el.id !== id));
      }
  };

  const handleTextComplete = () => {
      if (!textArea || !textareaRef.current) return;
      
      const text = textareaRef.current.value;
      if (!text.trim()) {
          // Remove empty text element
          setElements(elements.filter(el => el.id !== textArea.id));
      } else {
          // Update text content
          const newElements = elements.map(el => {
              if (el.id === textArea.id) {
                  return { ...el, text };
              }
              return el;
          });
          setElements(newElements);
      }
      setTextArea(null);
  };

  return (
    <>
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="bg-gray-50 cursor-crosshair"
    >
      <Layer>
        {elements.map((element) => {
          // Don't render the text element while we are editing it (it's just a placeholder rect or empty)
          if (element.type === "text" && textArea?.id === element.id) {
              // Render a placeholder rectangle while drawing/editing
              return (
                <Rect
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    stroke="#999"
                    dash={[5, 5]}
                    strokeWidth={1}
                />
              );
          }

          const commonProps = {
              key: element.id,
              onClick: () => handleShapeClick(element.id),
              onTap: () => handleShapeClick(element.id),
              onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
                  if (tool === "eraser") {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = "not-allowed";
                  }
              },
              onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
                  if (tool === "eraser") {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = "crosshair";
                  }
              }
          };

          if (element.type === "rectangle") {
            return (
              <Rect
                {...commonProps}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
              />
            );
          }
          if (element.type === "ellipse") {
             const radiusX = Math.abs(element.width || 0) / 2;
             const radiusY = Math.abs(element.height || 0) / 2;
             const centerX = element.x + (element.width || 0) / 2;
             const centerY = element.y + (element.height || 0) / 2;
             
            return (
              <Ellipse
                {...commonProps}
                x={centerX}
                y={centerY}
                radiusX={radiusX}
                radiusY={radiusY}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
              />
            );
          }
          if (element.type === "pencil") {
            return (
              <Line
                {...commonProps}
                points={element.points}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
                tension={0.5}
                lineCap="round"
                hitStrokeWidth={10} // Make it easier to click lines
              />
            );
          }
          if (element.type === "text") {
              return (
                  <Text 
                    {...commonProps}
                    x={element.x}
                    y={element.y}
                    text={element.text}
                    fontSize={20}
                    fill={element.stroke}
                    width={element.width}
                  />
              )
          }
          return null;
        })}
      </Layer>
    </Stage>
    {textArea && (
        <textarea
            ref={textareaRef}
            value={undefined} // Uncontrolled for simplicity, or bind to state if needed
            onBlur={handleTextComplete}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleTextComplete();
                }
            }}
            style={{
                position: "absolute",
                top: textArea.y,
                left: textArea.x,
                width: textArea.width,
                height: textArea.height,
                fontSize: "20px",
                border: "1px dashed #000",
                margin: 0,
                padding: 0,
                background: "transparent",
                outline: "none",
                resize: "none",
                overflow: "hidden",
                zIndex: 100, // Ensure it's above the canvas
            }}
        />
    )}
    </>
  );
};
