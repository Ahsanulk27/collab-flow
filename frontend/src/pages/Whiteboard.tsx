import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Canvas } from "@/components/whiteboard/Canvas";
import { Toolbar } from "@/components/whiteboard/Toolbar";
import { Shape, Tool } from "@/types/whiteboard";

const API_BASE = import.meta.env.VITE_API_BASE;

const Whiteboard = () => {
  const { workspaceId } = useParams();
  const [elements, setElements] = useState<Shape[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Load initial data
  useEffect(() => {
    const fetchWhiteboard = async () => {
      try {
        
        const res = await axios.get(`${API_BASE}/whiteboards/${workspaceId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.elements) {
            setElements(res.data.elements);
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

  // Save data
  const handleElementsChange = async (newElements: Shape[]) => {
    setElements(newElements);
    
    if (!workspaceId) return;

    // Note: In a real app, you should debounce this API call to avoid spamming the server
    try {
        await axios.put(`${API_BASE}/whiteboards/${workspaceId}`, {
            elements: newElements
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error("Failed to save", error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading whiteboard...</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      <Toolbar activeTool={tool} setTool={setTool} />
      <Canvas elements={elements} setElements={handleElementsChange} tool={tool} />
    </div>
  );
};

export default Whiteboard;
