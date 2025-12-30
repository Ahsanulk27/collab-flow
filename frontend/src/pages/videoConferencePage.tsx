import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

// 1. Declare Global Type
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const VideoConferencePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  const apiRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleLeave = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    navigate(`/workspaces/${workspaceId}`);
  };

  useEffect(() => {
    if (!workspaceId || !user || !jitsiContainerRef.current) return;

    const domain = "meet.jit.si";
    const roomName = `collab-flow-${workspaceId.replace(/[^a-zA-Z0-9-]/g, "")}`;

    const initialize = () => {
      if (apiRef.current) apiRef.current.dispose();

      const options = {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName: user.name, email: user.email },
        configOverwrite: {
          prejoinPageEnabled: false, // Skip Jitsi's lobby
          disableDeepLinking: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "participants-pane",
            "hangup",
          ],
          TOOLBAR_ALWAYS_VISIBLE: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },

        onload: () => {
          console.log("Jitsi Iframe loaded into DOM");
          setIsLoading(false);
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      const timer = setTimeout(() => {
        setIsLoading(false);
        console.log("Forcing loader off via safety timer");
      }, 5000);

      // 5. Add Live Sync Listeners

      api.addEventListeners({
        videoConferenceJoined: () => {
          clearTimeout(timer);
          setIsLoading(false);
          console.log("Jitsi fully initialized");
        },
        audioMuteStatusChanged: (data: any) => setIsMuted(data.muted),
        videoMuteStatusChanged: (data: any) => setIsVideoOff(data.muted),
        readyToClose: handleLeave,
      });
    };

    // Script injection logic
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = initialize;
      document.body.appendChild(script);
    } else {
      initialize();
    }

    return () => apiRef.current?.dispose();
  }, [workspaceId, user]);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col gap-4 p-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Meeting
          </Button>
          {!isLoading && (
            <div className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">
              SECURE BRIDGE ACTIVE
            </div>
          )}
        </div>

        <div className="flex-1 relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="text-slate-400 font-medium">
                  Synchronizing API Bridge...
                </p>
              </div>
            </div>
          )}
          <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoConferencePage;
