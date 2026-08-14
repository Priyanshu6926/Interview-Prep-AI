import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Mic, Send, Video, VideoOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

function MockRoomDetailPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [mediaError, setMediaError] = useState("");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const processedSignalsRef = useRef(new Set());
  const processedCandidatesRef = useRef(new Set());

  const role = useMemo(() => {
    if (!room || !user) {
      return null;
    }
    if (room.host?.user === user.id || room.host?.user?._id === user.id) {
      return "host";
    }
    if (room.guest?.user === user.id || room.guest?.user?._id === user.id) {
      return "guest";
    }
    return null;
  }, [room, user]);

  useEffect(() => {
    let isMounted = true;

    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/mock-rooms/${roomCode}`);
        if (isMounted) {
          setRoom(data.room);
        }
      } catch (err) {
        if (isMounted) {
          setMediaError(err.response?.data?.message || "Failed to sync room data.");
        }
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomCode]);

  useEffect(() => {
    return () => {
      try {
        peerRef.current?.close();
        peerRef.current = null;
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      } catch {
        // Safe cleanup
      }
    };
  }, []);

  const ensureMedia = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch {
      setMediaError("Camera or microphone access was blocked.");
      return null;
    }
  }, []);

  const ensurePeer = useCallback(async () => {
    if (peerRef.current) {
      return peerRef.current;
    }

    const stream = await ensureMedia();
    if (!stream) {
      return null;
    }

    const peer = new RTCPeerConnection(rtcConfig);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    peer.onicecandidate = async (event) => {
      if (event.candidate && role) {
        await api.post(`/mock-rooms/${roomCode}/candidate`, {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          fromRole: role
        });
      }
    };
    peerRef.current = peer;
    return peer;
  }, [ensureMedia, role, roomCode]);

  useEffect(() => {
    const syncConnection = async () => {
      if (!room || !role || room.status !== "active") {
        return;
      }

      const peer = await ensurePeer();
      if (!peer) {
        return;
      }

      if (role === "host" && room.guest && !room.signals.some((signal) => signal.type === "offer" && signal.fromRole === "host")) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        await api.post(`/mock-rooms/${roomCode}/signal`, {
          type: "offer",
          sdp: offer.sdp,
          fromRole: "host"
        });
        return;
      }

      for (const signal of room.signals) {
        const key = `${signal.type}-${signal.fromRole}-${signal.createdAt}`;
        if (processedSignalsRef.current.has(key) || signal.fromRole === role) {
          continue;
        }

        if (signal.type === "offer" && role === "guest") {
          await peer.setRemoteDescription({ type: "offer", sdp: signal.sdp });
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          await api.post(`/mock-rooms/${roomCode}/signal`, {
            type: "answer",
            sdp: answer.sdp,
            fromRole: "guest"
          });
        }

        if (signal.type === "answer" && role === "host") {
          await peer.setRemoteDescription({ type: "answer", sdp: signal.sdp });
        }

        processedSignalsRef.current.add(key);
      }

      for (const candidate of room.iceCandidates) {
        const key = `${candidate.fromRole}-${candidate.createdAt}-${candidate.candidate}`;
        if (processedCandidatesRef.current.has(key) || candidate.fromRole === role) {
          continue;
        }

        await peer.addIceCandidate({
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex
        });
        processedCandidatesRef.current.add(key);
      }
    };

    syncConnection();
  }, [ensurePeer, role, room, roomCode]);

  const sendEvent = async (kind, content, activePromptIndex = room?.activePromptIndex) => {
    const { data } = await api.post(`/mock-rooms/${roomCode}/events`, {
      kind,
      content,
      activePromptIndex,
      fromRole: role
    });
    setRoom(data.room);
    setMessage("");
  };

  if (!room) {
    return <p className="text-sm text-slate-500">Loading room...</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-100">Room code {room.roomCode}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{room.topic}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {room.roleFocus} mock interview for {room.experience} years experience. {room.guest ? "Both peers are connected." : "Waiting for a second participant."}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="grid gap-4 md:grid-cols-2">
          <div className="glass-panel overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
              <span>Your camera</span>
              <button onClick={ensureMedia} className="inline-flex items-center gap-2 text-brand-600">
                <Video className="h-4 w-4" />
                Enable
              </button>
            </div>
            <video ref={localVideoRef} autoPlay playsInline muted className="h-72 w-full bg-slate-100 object-cover" />
          </div>
          <div className="glass-panel overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
              <span>Peer stream</span>
              <span className="inline-flex items-center gap-2 text-slate-500">
                {room.guest ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                {room.guest ? "Connected" : "Waiting"}
              </span>
            </div>
            <video ref={remoteVideoRef} autoPlay playsInline className="h-72 w-full bg-slate-100 object-cover" />
          </div>
          {mediaError ? <p className="text-sm text-rose-500">{mediaError}</p> : null}
        </section>

        <aside className="glass-panel p-6">
          <p className="text-sm font-semibold text-slate-900">AI prompt queue</p>
          <div className="mt-4 space-y-3">
            {room.prompts.map((prompt, index) => (
              <button
                key={`${prompt.question}-${index}`}
                onClick={() => sendEvent("turn", `Moved to prompt ${index + 1}`, index)}
                className={`w-full rounded-2xl border p-4 text-left ${
                  room.activePromptIndex === index ? "border-brand-200 bg-brand-50" : "border-slate-100 bg-white"
                }`}
              >
                <p className="text-sm font-medium text-slate-900">{prompt.question}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Room notes</p>
            <div className="mt-3 max-h-64 space-y-3 overflow-auto">
              {room.events.map((event, index) => (
                <div key={`${event.createdAt}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{event.fromRole}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{event.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <input
                className="input-field"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Add a room note or feedback"
              />
              <button onClick={() => sendEvent("note", message)} className="primary-button" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => sendEvent("feedback", "Strong answer. Add one tradeoff and one metric to make it sharper.")}
              className="secondary-button mt-4"
            >
              <Mic className="mr-2 h-4 w-4" />
              Send sample feedback
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MockRoomDetailPage;
