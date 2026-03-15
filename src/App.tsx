import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Speakers from "./pages/Speakers";
import Mentors from "./pages/Mentors";
import Catering from "./pages/Catering";
import Communities from "./pages/Communities";
import AIAssistant from "./pages/AIAssistant";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SpeakerDashboard from "./pages/SpeakerDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import CateringDashboard from "./pages/CateringDashboard";
import CommunityDashboard from "./pages/CommunityDashboard";
import Messages from "./pages/Messages";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute userOnly><AppLayout><Index /></AppLayout></ProtectedRoute>} />
            <Route path="/speakers" element={<ProtectedRoute userOnly><AppLayout><Speakers /></AppLayout></ProtectedRoute>} />
            <Route path="/mentors" element={<ProtectedRoute userOnly><AppLayout><Mentors /></AppLayout></ProtectedRoute>} />
            <Route path="/catering" element={<ProtectedRoute userOnly><AppLayout><Catering /></AppLayout></ProtectedRoute>} />
            <Route path="/communities" element={<ProtectedRoute userOnly><AppLayout><Communities /></AppLayout></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AppLayout><AIAssistant /></AppLayout></ProtectedRoute>} />
            <Route path="/dashboard/speaker" element={<ProtectedRoute><AppLayout><SpeakerDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/dashboard/mentor" element={<ProtectedRoute><AppLayout><MentorDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/dashboard/catering" element={<ProtectedRoute><AppLayout><CateringDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/dashboard/community" element={<ProtectedRoute><AppLayout><CommunityDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><AppLayout><PublicProfile /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
