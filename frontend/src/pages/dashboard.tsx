import DashboardLayout from "@/components/DashboardLayout";
import WorkspaceCard from "@/components/WorkspaceCard";
import { Workspace } from "@/types/workspace";
import JoinWorkspaceDialog from "@/components/JoinWorkspaceDialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const mapWorkspaceToCard = (workspace: Workspace) => ({
  id: workspace.id, // not using as of now
  title: workspace.name,
  description: workspace.description,
  icon: "🗂️",
  iconBg: "bg-sky-100",
  badges: [
    {
      label: `${workspace.members.length} members`,
      variant: "success" as const,
    },
  ],
  avatars: workspace.members.slice(0, 5).map((m) => ({
    src: m.user.profileImage || undefined,
    fallback: m.user.name
      .split(" ")
      .map((n) => n[0])
      .join(""),
  })),
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinOpen, setJoinOpen] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    navigate("/login");
  }
  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get(`${API_BASE}/workspaces`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      console.error("Failed to load workspaces", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWorkspaces();
  }, []);
  const handleLeaveWorkspace = async (
    workspaceId: string,
    workspaceName: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to leave "${workspaceName}"?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/workspaces/${workspaceId}/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh workspace list
      fetchWorkspaces();
    } catch (err) {
      console.error("Failed to leave workspace", err);
      alert("Failed to leave workspace");
    }
  };
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Your Workspaces
        </h1>
        <p className="text-muted-foreground mt-1">
          Collaborate, create, and connect with your team.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <WorkspaceCard isAddCard />
        <WorkspaceCard isJoinCard onJoinClick={() => setJoinOpen(true)} />
        {workspaces.map((workspace) => (
          <WorkspaceCard
            key={workspace.id}
            {...mapWorkspaceToCard(workspace)}
            onLeaveClick={() => handleLeaveWorkspace(workspace.id, workspace.name)}
          />
        ))}
      </div>

      <JoinWorkspaceDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        onSuccess={fetchWorkspaces}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
