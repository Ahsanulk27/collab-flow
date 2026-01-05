import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  Ellipse,
  Line,
  Text,
  Image as KonvaImage,
} from "react-konva";
import Konva from "konva";
import { Shape, Tool } from "@/types/whiteboard";
import { v4 as uuidv4 } from "uuid";

interface CanvasProps {
  elements: Shape[];
  setElements: (elements: Shape[]) => void;
  tool: Tool;
  color: string;
  onActionEnd: (updatedElements?: Shape[]) => void;
  selectedIcon?: string | null;
}

// Custom Cursor SVG
const CURSORS = {
  pencil: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>') 0 20, auto`,
  eraser: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21Z"/><path d="m22 21H7"/><path d="m5 11 9 9"/></svg>') 0 20, auto`,
  select: "default",
  move: "grab",
  text: "text",
  crosshair: "crosshair",
};

export interface CanvasHandle {
  exportImage: () => void;
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  (
    {
      elements,
      setElements,
      tool,
      color,
      onActionEnd,
      selectedIcon,
    }: CanvasProps,
    ref
  ) => {
    const isDrawing = useRef(false);
    const [textArea, setTextArea] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
      id: string;
    } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const iconImageRefs = useRef<Map<string, HTMLImageElement>>(new Map());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const stageRef = useRef<Konva.Stage>(null);

    useEffect(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const container = stage.container();

      switch (tool) {
        case "pencil":
          container.style.cursor = CURSORS.pencil;
          break;
        case "eraser":
          container.style.cursor = CURSORS.eraser;
          break;
        case "select":
          container.style.cursor = CURSORS.select;
          break;
        case "text":
          container.style.cursor = CURSORS.text;
          break;
        case "rectangle":
        case "ellipse":
          container.style.cursor = CURSORS.crosshair;
          break;
        default:
          container.style.cursor = "default";
      }
    }, [tool]);

    useEffect(() => {
      if (textArea && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [textArea]);

    const convertIconToImage = (
      iconName: string,
      iconColor: string,
      width: number,
      height: number
    ): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const cacheKey = `${iconName}-${iconColor}-${width}-${height}`;
        if (iconImageRefs.current.has(cacheKey)) {
          resolve(iconImageRefs.current.get(cacheKey)!);
          return;
        }

        fetch(
          `https://api.iconify.design/${iconName}.svg?color=${encodeURIComponent(
            iconColor
          )}`
        )
          .then((res) => res.text())
          .then((svgText) => {
            const img = new window.Image();
            const blob = new Blob([svgText], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            img.onload = () => {
              iconImageRefs.current.set(cacheKey, img);
              resolve(img);
            };
            img.onerror = () => reject(new Error("Failed to load icon"));
            img.src = url;
          })
          .catch(reject);
      });
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (tool === "icon" && selectedIcon) {
        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();
        if (pos) {
          const id = uuidv4();
          const newIcon: Shape = {
            id,
            type: "icon",
            x: pos.x,
            y: pos.y,
            width: 50,
            height: 50,
            stroke: color,
            strokeWidth: 0,
            iconName: selectedIcon,
            iconColor: color,
          };
          setElements([...elements, newIcon]);
          onActionEnd([...elements, newIcon]);
        }
        return;
      }

      if (tool === "select" || tool === "eraser" || textArea) return;

      isDrawing.current = true;
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      const id = uuidv4();

      const newShape: Shape = {
        id,
        type: tool,
        x: pos?.x || 0,
        y: pos?.y || 0,
        width: 0,
        height: 0,
        points: tool === "pencil" ? [pos?.x || 0, pos?.y || 0] : undefined,
        stroke: color,
        strokeWidth: 2,
        text: tool === "text" ? "" : undefined,
      };

      setElements([...elements, newShape]);
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (
        !isDrawing.current ||
        tool === "select" ||
        tool === "eraser" ||
        tool === "icon"
      )
        return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      if (!point) return;

      const lastElement = elements[elements.length - 1];
      const index = elements.length - 1;

      if (tool === "pencil") {
        const newPoints = lastElement.points!.concat([point.x, point.y]);
        const newElements = [...elements];
        newElements[index] = { ...lastElement, points: newPoints };
        setElements(newElements);
      } else {
        const newElements = [...elements];
        newElements[index] = {
          ...lastElement,
          width: point.x - lastElement.x,
          height: point.y - lastElement.y,
        };
        setElements(newElements);
      }
    };

    const handleExport = () => {
      if (!stageRef.current) return;
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "whiteboard.png";
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    useImperativeHandle(ref, () => ({
      exportImage: handleExport,
    }));

    const handleMouseUp = () => {
      if (isDrawing.current) {
        if (tool === "text") {
          const lastElement = elements[elements.length - 1];
          const width =
            Math.abs(lastElement.width || 0) < 20 ? 100 : lastElement.width;
          const height =
            Math.abs(lastElement.height || 0) < 20 ? 50 : lastElement.height;

          setTextArea({
            x: lastElement.x,
            y: lastElement.y,
            width: width || 100,
            height: height || 50,
            id: lastElement.id,
          });
        } else {
          onActionEnd();
        }
      }
      isDrawing.current = false;
    };

    const handleShapeClick = (id: string) => {
      if (tool === "eraser") {
        const newElements = elements.filter((el) => el.id !== id);
        setElements(newElements);
        onActionEnd(newElements);
      }
      if (tool === "select") setSelectedId(id);
    };

    const handleTextComplete = () => {
      if (!textArea || !textareaRef.current) return;
      const text = textareaRef.current.value;
      let newElements;
      if (!text.trim()) {
        newElements = elements.filter((el) => el.id !== textArea.id);
      } else {
        newElements = elements.map((el) =>
          el.id === textArea.id ? { ...el, text } : el
        );
      }
      setElements(newElements);
      onActionEnd(newElements);
      setTextArea(null);
    };

    const IconImage = ({ element }: { element: Shape }) => {
      const [img, setImg] = useState<HTMLImageElement | null>(null);
      useEffect(() => {
        if (element.iconName) {
          const iconColor = element.iconColor || element.stroke || "#000000";
          convertIconToImage(
            element.iconName,
            iconColor,
            element.width || 50,
            element.height || 50
          )
            .then(setImg)
            .catch(console.error);
        }
      }, [
        element.iconName,
        element.iconColor,
        element.width,
        element.height,
        element.stroke,
      ]);

      if (!img) return null;
      return (
        <KonvaImage
          image={img}
          x={element.x}
          y={element.y}
          width={element.width || 50}
          height={element.height || 50}
          draggable={tool === "select" && selectedId === element.id}
          onClick={() => handleShapeClick(element.id)}
          onDragEnd={(e) => {
            const { x, y } = e.target.position();
            const newElements = elements.map((el) =>
              el.id === element.id ? { ...el, x, y } : el
            );
            setElements(newElements);
            onActionEnd(newElements);
          }}
        />
      );
    };

    return (
      <>
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
            handleMouseDown(e);
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="bg-gray-50"
        >
          <Layer>
            {elements.map((element) => {
              if (element.type === "icon" && element.iconName)
                return <IconImage key={element.id} element={element} />;
              if (element.type === "text" && textArea?.id === element.id) {
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
                onClick: () =>
                  tool === "eraser" && handleShapeClick(element.id),
                onMouseDown: (e: any) => {
                  if (tool === "select") {
                    e.cancelBubble = true;
                    setSelectedId(element.id);
                  }
                },
                draggable: tool === "select" && selectedId === element.id,
                onDragEnd: (e: any) => {
                  const { x, y } = e.target.position();
                  const newElements = elements.map((el) =>
                    el.id === element.id ? { ...el, x, y } : el
                  );
                  setElements(newElements);
                  onActionEnd(newElements);
                },
              };

              if (element.type === "rectangle")
                return (
                  <Rect
                    key={element.id}
                    {...commonProps}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    stroke={
                      selectedId === element.id ? "#2563eb" : element.stroke
                    }
                    strokeWidth={
                      selectedId === element.id ? 3 : element.strokeWidth
                    }
                  />
                );
              if (element.type === "ellipse")
                return (
                  <Ellipse
                    key={element.id}
                    {...commonProps}
                    x={element.x + (element.width || 0) / 2}
                    y={element.y + (element.height || 0) / 2}
                    radiusX={Math.abs(element.width || 0) / 2}
                    radiusY={Math.abs(element.height || 0) / 2}
                    stroke={
                      selectedId === element.id ? "#2563eb" : element.stroke
                    }
                    strokeWidth={
                      selectedId === element.id ? 3 : element.strokeWidth
                    }
                  />
                );
              if (element.type === "pencil")
                return (
                  <Line
                    key={element.id}
                    {...commonProps}
                    points={element.points}
                    stroke={element.stroke}
                    strokeWidth={
                      selectedId === element.id ? 3 : element.strokeWidth
                    }
                    tension={0.5}
                    lineCap="round"
                    hitStrokeWidth={15}
                  />
                );
              if (element.type === "text")
                return (
                  <Text
                    key={element.id}
                    {...commonProps}
                    x={element.x}
                    y={element.y}
                    text={element.text}
                    fontSize={20}
                    fill={
                      selectedId === element.id ? "#2563eb" : element.stroke
                    }
                    width={element.width}
                  />
                );
              return null;
            })}
          </Layer>
        </Stage>
        {textArea && (
          <textarea
            ref={textareaRef}
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
              background: "transparent",
              outline: "none",
              resize: "none",
              zIndex: 100,
            }}
          />
        )}
      </>
    );
  }
);
