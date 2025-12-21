import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Users, Briefcase, Code, Palette, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const AddWorkspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");

  const handleCreate = async () => {
    if (!workspaceName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a workspace name",
        variant: "destructive",
      });
      return;
    }

    try{
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/workspaces`,
        {
          name: workspaceName,
          description: workspaceDescription || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      )

      const workspaceId = res.data.workspace.id;
      toast({
        title: "Workspace created!",
        description: `${workspaceName} is ready to use`,
      })
      navigate(`/workspaces/${workspaceId}`)
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create workspace",
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <div className="min-h-screen bg-aqua-gradient">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/30 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">New Workspace</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Create your workspace
            </h1>
          </div>

          {/* Form Card */}
          <Card variant="glass-solid" className="p-6 md:p-8">
            <CardContent className="p-0 space-y-8">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">Workspace name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Product Launch Q1"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="What's this workspace for?"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  className="min-h-[100px] text-base resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="teal"
                  size="lg"
                  className="flex-1 h-12 text-base"
                  onClick={handleCreate}
                >
                  Create Workspace
                </Button>
                <Button
                  variant="glass"
                  size="lg"
                  className="h-12 text-base"
                  asChild
                >
                  <Link to="/dashboard">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 You can invite team members and customize your workspace after creating it
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddWorkspace;
