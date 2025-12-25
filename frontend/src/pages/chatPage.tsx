import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineIndicator from "@/components/onlineIndicator";
import { Send, Paperclip, Hash, Loader2 } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { jwtDecode } from "jwt-decode";

const API_BASE = import.meta.env.VITE_API_BASE;
const BACKEND_URL = API_BASE.replace("/api/v1", "");

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profileImage: string | null;
    email: string;
  };
}

const ChatPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  let currentUserId: string;
  if (token) {
    const decoded = jwtDecode<{ userId: string; email: string }>(token);
    currentUserId = decoded.userId;
  } else {
    currentUserId = null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!workspaceId) return;

      try {
        const res = await axios.get(
          `${API_BASE}/workspaces/${workspaceId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [workspaceId, token]);

  useEffect(() => {
    if (!socket || !workspaceId) return;

    socket.emit("joinWorkspace", workspaceId);

    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socket.on("messageError", (error: { message: string }) => {
      console.error("Message error:", error.message);
      alert(error.message);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageError");
    };
  }, [socket, workspaceId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !workspaceId || sending) return;

    setSending(true);

    try {
      socket.emit("sendMessage", {
        workspaceId,
        content: newMessage.trim(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Chat area */}
        <Card variant="glass-solid" className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-display font-semibold">Workspace Chat</h2>
            </div>
            <div className="flex items-center gap-2">
              <OnlineIndicator isOnline={isConnected} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender.id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          msg.sender.profileImage
                            ? `${BACKEND_URL}${
                                msg.sender.profileImage
                              }?t=${Date.now()}`
                            : undefined
                        }
                      />
                      <AvatarFallback>
                        {msg.sender.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-md ${isOwn ? "text-right" : ""}`}>
                      <div
                        className={`flex items-center gap-2 mb-1 ${
                          isOwn ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {isOwn ? "You" : msg.sender.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-tr-md"
                            : "bg-white/90 backdrop-blur-sm border border-white/50 shadow-glass rounded-tl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/30">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                disabled
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!isConnected || sending}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="teal"
                size="icon"
                className="flex-shrink-0"
                disabled={!newMessage.trim() || !isConnected || sending}
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
