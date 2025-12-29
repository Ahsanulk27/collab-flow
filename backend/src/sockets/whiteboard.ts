import { Server, Socket } from "socket.io";

export const handleWhiteboardEvents = (socket: Socket, io: Server) => {
  socket.on("join-whiteboard", (workspaceId: string) => {
    socket.join(`whiteboard-${workspaceId}`);
    console.log(`User ${socket.id} joined whiteboard ${workspaceId}`);
  });

  socket.on("leave-whiteboard", (workspaceId: string) => {
    socket.leave(`whiteboard-${workspaceId}`);
    console.log(`User ${socket.id} left whiteboard ${workspaceId}`);
  });

  socket.on("whiteboard-update", ({ workspaceId, elements, pageId }) => {
    // Broadcast to everyone else in the room
    socket.to(`whiteboard-${workspaceId}`).emit("whiteboard-updated", {
      elements,
      pageId
    });
  });
};
