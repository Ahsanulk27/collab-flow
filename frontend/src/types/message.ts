export interface MessageSender {
  id: string;
  name: string | null;
  profileImage: string | null;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string; 
  sender: MessageSender;
}