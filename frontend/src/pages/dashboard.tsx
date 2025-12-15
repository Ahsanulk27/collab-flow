import DashboardLayout from "@/components/DashboardLayout";
import WorkspaceCard from "@/components/WorkspaceCard";
import { Workspace } from "@/types/workspace";
import { useEffect, useState } from "react";
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

const workspaces = [
  {
    id: "product-design",
    title: "Product Design",
    description: "UI/UX work and design system updates",
    icon: "🎨",
    iconBg: "bg-violet-100",
    badges: [{ label: "Open", variant: "success" as const }],
    avatars: [
      {
        src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        fallback: "SC",
      },
      {
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        fallback: "DC",
      },
      { fallback: "ML" },
    ],
  },
  {
    id: "marketing-analytics",
    title: "Marketing Analytics",
    description: "Q4 campaigns and strategy planning",
    icon: "📊",
    iconBg: "bg-emerald-100",
    badges: [
      { label: "Urgent", variant: "urgent" as const },
      { label: "2 days left", variant: "warning" as const },
    ],
    avatars: [
      {
        src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        fallback: "ED",
      },
      { fallback: "JK" },
    ],
  },
  {
    id: "dev-sprint",
    title: "Development Sprint",
    description: "Frontend and backend development coordination",
    icon: "💻",
    iconBg: "bg-sky-100",
    badges: [
      { label: "API integration completed", variant: "success" as const },
      { label: "Frontend review - 2 days", variant: "warning" as const },
    ],
    avatars: [
      {
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        fallback: "JD",
      },
      {
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        fallback: "DC",
      },
      { fallback: "AM" },
      { fallback: "KP" },
      { fallback: "TL" },
    ],
  },
  {
    id: "team-onboarding",
    title: "Team Onboarding",
    description: "New member resources and training materials",
    icon: "👥",
    iconBg: "bg-amber-100",
    badges: [{ label: "Open", variant: "success" as const }],
    avatars: [{ fallback: "HR" }, { fallback: "LM" }],
  },
];

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  useEffect(() => {
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

    fetchWorkspaces();
  }, []);
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
        <WorkspaceCard
          id=""
          title=""
          description=""
          icon=""
          iconBg=""
          badges={[]}
          avatars={[]}
          isAddCard
        />
        {workspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} {...mapWorkspaceToCard(workspace)} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
