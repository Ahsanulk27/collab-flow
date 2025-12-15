import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
// import WorkspaceOverview from "./pages/WorkspaceOverview";
// import ChatPage from "./pages/ChatPage";
// import TaskBoard from "./pages/TaskBoard";
// import Whiteboard from "./pages/Whiteboard";
// import ProfilePage from "./pages/ProfilePage";
// import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {<Route element={<ProtectedRoute/>}> 
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          /* 
          <Route path="/workspace/:id" element={<WorkspaceOverview />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/whiteboard" element={<Whiteboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          */}

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
