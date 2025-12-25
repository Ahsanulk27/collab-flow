import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import WorkspaceOverview from "./pages/workspaceOverview";
import ChatPage from "./pages/chatPage";
// import TaskBoard from "./pages/TaskBoard";
import Whiteboard from "./pages/Whiteboard";
import Profile from "./pages/profile";
// import ProfilePage from "./pages/ProfilePage";
// import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import AddWorkspace from "./pages/addWorkspace";
import { UserProvider } from "./context/UserContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workspaces/:workspaceId" element={<WorkspaceOverview />} />
              <Route path="/addWorkspace" element={<AddWorkspace />} />
              <Route path="/workspaces/:workspaceId/chat" element={<ChatPage />} />
              <Route path="/workspaces/:workspaceId/whiteboard" element={<Whiteboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/*
            <Route path="/tasks" element={<TaskBoard />} />
            <Route path="/whiteboard" element={<Whiteboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            */}

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);


export default App;
