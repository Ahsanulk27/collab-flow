import { Socket, Server } from "socket.io";
import { prisma } from "../config/db";

interface SendMessageData {
  workspaceId: string;
  content: string;
}

export const handleChatEvents = (socket: Socket, io: Server) => {
  socket.on("joinWorkspace", (workspaceId: string) => {
    socket.join(workspaceId);
    console.log(`User ${socket.id} joined workspace ${workspaceId}`);
  });

  socket.on("sendMessage", async (data: SendMessageData) => {
    try {
      const senderId = socket.data?.user?.userId;
      if (!senderId) {
        return socket.emit("messageError", {
          message: "Authentication required",
        });
      }

      const membership = await prisma.workspaceMember.findFirst({
        where: {
          userId: senderId,
          workspaceId: data.workspaceId,
        },
      });
      if (!membership) {
        return socket.emit("messageError", {
          message: "You are not a member of this workspace",
        });
      }

      const message = await prisma.message.create({
        data: {
          workspaceId: data.workspaceId,
          senderId: senderId,
          content: data.content,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              email: true,
            },
          },
        },
      });
      io.to(data.workspaceId).emit("newMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { message: "Failed to send message" });
    }
  });
};
