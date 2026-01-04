import { useEffect, useState } from "react";
import { useSocket } from "../hooks/use-socket";
import OnlineIndicator from "./onlineIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface User {
  id: string;
  name: string;
  profileImage?: string | null;
}

interface OnlineUsersListProps {
  workspaceId: string;
}

const API_BASE = import.meta.env.VITE_API_BASE;
const BACKEND_URL = API_BASE.replace("/api/v1", "");

const OnlineUsersList = ({ workspaceId }: OnlineUsersListProps) => {
  const { socket, isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("joinWorkspace", workspaceId);

    socket.on("onlineUsers", (users: User[]) => {
      console.log("Received online users:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("onlineUsers");
    };
  }, [socket, isConnected, workspaceId]);

  if (!isConnected) {
    return <div className="text-sm text-gray-500">Connecting...</div>;
  }

  if (onlineUsers.length === 0) {
    return <div className="text-sm text-gray-500">No users online</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">
        Online Now ({onlineUsers.length})
      </h3>
      <div className="space-y-1">
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
          >
            <OnlineIndicator isOnline={true} className="" />
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    user.profileImage
                      ? `${BACKEND_URL}${user.profileImage}`
                      : undefined
                  }
                />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsersList;
