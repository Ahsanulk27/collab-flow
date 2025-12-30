import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Canvas } from "@/components/whiteboard/Canvas";
import { Toolbar } from "@/components/whiteboard/Toolbar";
import { Shape, Tool, Page } from "@/types/whiteboard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import DashboardLayout from "@/components/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_BASE;

const Whiteboard = () => {
  const { workspaceId } = useParams();
  const { socket } = useSocket();
  const [pages, setPages] = useState<Page[]>([{ id: "1", elements: [] }]);
  const [activePageId, setActivePageId] = useState<string>("1");

  // History per page: pageId -> { stack: Shape[][], step: number }
  const [history, setHistory] = useState<
    Record<string, { stack: Shape[][]; step: number }>
  >({
    "1": { stack: [[]], step: 0 },
  });

  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState("#000000");
  const [loading, setLoading] = useState(true);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Derived state for current page elements
  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const elements = activePage.elements;

  // Socket connection
  useEffect(() => {
    if (!socket || !workspaceId) return;

    socket.emit("join-whiteboard", workspaceId);

    socket.on("whiteboard-updated", ({ elements: newElements, pageId }) => {
      setPages((prevPages) =>
        prevPages.map((p) =>
          p.id === pageId ? { ...p, elements: newElements } : p
        )
      );

      // Update history for the updated page
      setHistory((prevHistory) => {
        const currentHistory = prevHistory[pageId] || { stack: [[]], step: 0 };
        const newStack = [...currentHistory.stack, newElements];
        return {
          ...prevHistory,
          [pageId]: { stack: newStack, step: newStack.length - 1 },
        };
      });
    });

    return () => {
      socket.emit("leave-whiteboard", workspaceId);
      socket.off("whiteboard-updated");
    };
  }, [socket, workspaceId]);

  // Load initial data
  useEffect(() => {
    const fetchWhiteboard = async () => {
      try {
        const res = await axios.get(`${API_BASE}/whiteboards/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.elements) {
          const data = res.data.elements;
          // Check if data is Page[] or Shape[]
          if (Array.isArray(data) && data.length > 0 && "elements" in data[0]) {
            // It's Page[]
            setPages(data as Page[]);
            setActivePageId(data[0].id);
            // Initialize history for all pages
            const initialHistory: Record<
              string,
              { stack: Shape[][]; step: number }
            > = {};
            (data as Page[]).forEach((p) => {
              initialHistory[p.id] = { stack: [p.elements], step: 0 };
            });
            setHistory(initialHistory);
          } else {
            // It's Shape[] (Legacy)
            const initialPage: Page = { id: "1", elements: data as Shape[] };
            setPages([initialPage]);
            setActivePageId("1");
            setHistory({ "1": { stack: [data as Shape[]], step: 0 } });
          }
        }
      } catch (error) {
        console.error("Failed to load whiteboard", error);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchWhiteboard();
    } else {
      setLoading(false);
    }
  }, [workspaceId]);

  const saveWhiteboard = async (updatedPages: Page[]) => {
    if (!workspaceId) return;
    try {
      await axios.put(
        `${API_BASE}/whiteboards/${workspaceId}`,
        {
          elements: updatedPages,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  const updatePageElements = (
    newElements: Shape[],
    save = false,
    emit = false
  ) => {
    const updatedPages = pages.map((p) =>
      p.id === activePageId ? { ...p, elements: newElements } : p
    );
    setPages(updatedPages);
    if (save) {
      saveWhiteboard(updatedPages);
    }
    if (emit && socket) {
      socket.emit("whiteboard-update", {
        workspaceId,
        elements: newElements,
        pageId: activePageId,
      });
    }
  };

  const handleElementsChange = (newElements: Shape[]) => {
    updatePageElements(newElements, false, true); // Emit real-time updates while drawing
  };

  const handleActionEnd = (updatedElements?: Shape[]) => {
    const elementsToSave = updatedElements || elements;
    const currentHistory = history[activePageId] || { stack: [[]], step: 0 };
    const newStack = currentHistory.stack.slice(0, currentHistory.step + 1);
    newStack.push(elementsToSave);

    setHistory({
      ...history,
      [activePageId]: { stack: newStack, step: newStack.length - 1 },
    });

    updatePageElements(elementsToSave, true, true);
  };

  const undo = () => {
    const currentHistory = history[activePageId];
    if (currentHistory && currentHistory.step > 0) {
      const newStep = currentHistory.step - 1;
      const newElements = currentHistory.stack[newStep];

      setHistory({
        ...history,
        [activePageId]: { ...currentHistory, step: newStep },
      });
      updatePageElements(newElements, true, true);
    }
  };

  const redo = () => {
    const currentHistory = history[activePageId];
    if (
      currentHistory &&
      currentHistory.step < currentHistory.stack.length - 1
    ) {
      const newStep = currentHistory.step + 1;
      const newElements = currentHistory.stack[newStep];

      setHistory({
        ...history,
        [activePageId]: { ...currentHistory, step: newStep },
      });
      updatePageElements(newElements, true, true);
    }
  };

  const addPage = () => {
    const newPageId = (pages.length + 1).toString();
    const newPage: Page = { id: newPageId, elements: [] };
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    setActivePageId(newPageId);
    setHistory({
      ...history,
      [newPageId]: { stack: [[]], step: 0 },
    });
    saveWhiteboard(updatedPages);
  };

  const deletePage = () => {
    if (pages.length <= 1) return;
    const updatedPages = pages.filter((p) => p.id !== activePageId);
    setPages(updatedPages);
    setActivePageId(updatedPages[0].id);
    // Clean up history
    const newHistory = { ...history };
    delete newHistory[activePageId];
    setHistory(newHistory);
    saveWhiteboard(updatedPages);
  };

  const nextPage = () => {
    const currentIndex = pages.findIndex((p) => p.id === activePageId);
    if (currentIndex < pages.length - 1) {
      setActivePageId(pages[currentIndex + 1].id);
    }
  };

  const prevPage = () => {
    const currentIndex = pages.findIndex((p) => p.id === activePageId);
    if (currentIndex > 0) {
      setActivePageId(pages[currentIndex - 1].id);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading whiteboard...
      </div>
    );

  const currentHistory = history[activePageId] || { stack: [], step: -1 };
  const canUndo = currentHistory.step > 0;
  const canRedo = currentHistory.step < currentHistory.stack.length - 1;
  const pageIndex = pages.findIndex((p) => p.id === activePageId);

  return (
    <DashboardLayout>
      <div className="relative w-full h-screen overflow-hidden bg-gray-100">
        <Toolbar
          activeTool={tool}
          setTool={setTool}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          color={color}
          setColor={setColor}
        />

        <Canvas
          elements={elements}
          setElements={handleElementsChange}
          tool={tool}
          color={color}
          onActionEnd={handleActionEnd}
        />

        {/* Page Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg p-2 flex gap-2 z-10 border items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevPage}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {pageIndex + 1} / {pages.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextPage}
            disabled={pageIndex === pages.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="w-px bg-gray-200 mx-1 h-6" />
          <Button
            variant="ghost"
            size="icon"
            onClick={addPage}
            title="Add Page"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={deletePage}
            disabled={pages.length <= 1}
            title="Delete Page"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Whiteboard;
