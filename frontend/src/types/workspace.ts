export interface Workspace {
  id: string;
  name: string;
  description: string;
  members: {
    id: string;
    role: "OWNER" | "MEMBER";
    user: {
      id: string;
      name: string;
      profileImage: string | null;
    };
  }[];
}
