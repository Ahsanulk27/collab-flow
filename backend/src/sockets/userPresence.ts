import { Socket, Server } from "socket.io";
import { prisma } from "../config/db";
const onlineUsers = new Map<string, Set<string>>();
export const handleUserPresence = (socket: Socket, io: Server) => {
  socket.on("joinWorkspace", (workspaceId: string) => {
    const userId = socket.data?.user?.userId;
    
    if (!userId) {
      return socket.emit("presenceError", { message: "Authentication required" });
    }

    
    if (!onlineUsers.has(workspaceId)) {
      onlineUsers.set(workspaceId, new Set());
    }
    onlineUsers.get(workspaceId)?.add(userId);

    
    socket.join(workspaceId);

    console.log(`User ${userId} joined workspace ${workspaceId}`);
    emitOnlineUsers(workspaceId, io);
    
  });
  socket.on("disconnect", () => {
    const userId = socket.data?.user?.userId;
    if (!userId) return;

    console.log(`User ${userId} disconnected`);

    
    onlineUsers.forEach((users, workspaceId) => {
      if (users.has(userId)) {
        users.delete(userId);
        
        
        
      }
    });
  });


};
async function emitOnlineUsers(workspaceId: string, io: Server) {
  const userIds = Array.from(onlineUsers.get(workspaceId) || []);
  
  
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      name: true,
      profileImage: true,
    },
  });

  
  io.to(workspaceId).emit("onlineUsers", users);
}