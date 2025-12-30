import { Server, Socket } from "socket.io";
import { prisma } from "../config/db";


const activeUsers = new Map<string, Map<string, { id: string; name: string | null; email: string }>>();

const broadcastActiveUsers = async (io: Server, workspaceId: string) => {
  const roomName = `whiteboard-${workspaceId}`;
  const usersInRoom = activeUsers.get(workspaceId);
  
  if (!usersInRoom) {
    io.to(roomName).emit("whiteboard-active-users", []);
    return;
  }

  const usersArray = Array.from(usersInRoom.values());
  io.to(roomName).emit("whiteboard-active-users", usersArray);
};

export const handleWhiteboardEvents = (socket: Socket, io: Server) => {
  socket.on("join-whiteboard", async (workspaceId: string) => {
    try {
      const userId = socket.data?.user?.userId;
      if (!userId) {
        return;
      }

      socket.join(`whiteboard-${workspaceId}`);
      console.log(`User ${socket.id} joined whiteboard ${workspaceId}`);

     
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (user) {
        
        if (!activeUsers.has(workspaceId)) {
          activeUsers.set(workspaceId, new Map());
        }

       
        const roomUsers = activeUsers.get(workspaceId)!;
        roomUsers.set(socket.id, {
          id: user.id,
          name: user.name,
          email: user.email,
        });

        
        await broadcastActiveUsers(io, workspaceId);
      }
    } catch (error) {
      console.error("Error joining whiteboard:", error);
    }
  });

  socket.on("leave-whiteboard", async (workspaceId: string) => {
    try {
      socket.leave(`whiteboard-${workspaceId}`);
      console.log(`User ${socket.id} left whiteboard ${workspaceId}`);

   
      const roomUsers = activeUsers.get(workspaceId);
      if (roomUsers) {
        roomUsers.delete(socket.id);
        
        if (roomUsers.size === 0) {
          activeUsers.delete(workspaceId);
        } else {
        
          await broadcastActiveUsers(io, workspaceId);
        }
      }
    } catch (error) {
      console.error("Error leaving whiteboard:", error);
    }
  });

  socket.on("whiteboard-update", ({ workspaceId, elements, pageId }) => {

    socket.to(`whiteboard-${workspaceId}`).emit("whiteboard-updated", {
      elements,
      pageId
    });
  });

  
  socket.on("disconnect", async () => {
    
    for (const [workspaceId, roomUsers] of activeUsers.entries()) {
      if (roomUsers.has(socket.id)) {
        roomUsers.delete(socket.id);
        
        if (roomUsers.size === 0) {
          activeUsers.delete(workspaceId);
        } else {
          await broadcastActiveUsers(io, workspaceId);
        }
      }
    }
  });
};
