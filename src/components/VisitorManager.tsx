import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  Plus, 
  Search, 
  X, 
  CheckCircle2, 
  LogOut, 
  Eye, 
  Sparkles,
  Phone,
  Files,
  Camera,
  Upload,
  RotateCw,
  RefreshCw,
  AlertCircle,
  Check,
  Info,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  QrCode,
  Scan,
  Printer,
  Download
} from 'lucide-react';
import { VisitorLog, Staff } from '../types';

interface VisitorManagerProps {
  visitors: VisitorLog[];
  staffList: Staff[];
  onAddVisitor: (newVis: Omit<VisitorLog, 'id'>) => void;
  onCheckOutVisitor: (id: string, time: string) => void;
}

export const VisitorManager: React.FC<VisitorManagerProps> = ({
  visitors,
  staffList,
  onAddVisitor,
  onCheckOutVisitor
}) => {
  // Query state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration overlay modal state
  const [isNewVisitorOpen, setIsNewVisitorOpen] = useState(false);

  // New visitor form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPurpose, setFormPurpose] = useState('Parent-Teacher Meeting');
  const [formHostId, setFormHostId] = useState('');
  const [formIdProvided, setFormIdProvided] = useState("Aadhaar Card");
  const [formNotes, setFormNotes] = useState('Approved at gate entry');

  // Visitor History Look-Up state parameters
  const [activeMainTab, setActiveMainTab] = useState<'logs' | 'history'>('logs');
  const [historySearchPhone, setHistorySearchPhone] = useState('');
  const [isAutoFilledByHistory, setIsAutoFilledByHistory] = useState(false);

  // Toast notifications & receptionist alert states
  interface ToastItem {
    id: string;
    visitorName: string;
    hostName: string;
    message: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'default'
  );

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- TOUCHLESS CHECK-OUT QR CODE STATES & HANDLERS ---
  const [selectedPassVisitor, setSelectedPassVisitor] = useState<VisitorLog | null>(null);
  const [autoOpenPassForLatestName, setAutoOpenPassForLatestName] = useState<string | null>(null);
  const [isLobbyScannerOpen, setIsLobbyScannerOpen] = useState(false);
  const [manualBarcodeScan, setManualBarcodeScan] = useState('');
  const [recentScannedVisitor, setRecentScannedVisitor] = useState<string | null>(null);
  const [isLobbyCameraStreaming, setIsLobbyCameraStreaming] = useState(false);
  const [lobbyCameraError, setLobbyCameraError] = useState<string | null>(null);
  const lobbyScannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const lobbyScannerStreamRef = useRef<MediaStream | null>(null);

  // High-pitch scan beep audio synthesis
  const playScanBeep = () => {
    if (isAudioMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(950, audioCtx.currentTime); // crisp scan beep
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Web Audio scan beep blocked or failed:", e);
    }
  };

  // Manage checkout camera scan feed
  const startLobbyScannerCamera = async () => {
    setLobbyCameraError(null);
    if (lobbyScannerStreamRef.current) {
      lobbyScannerStreamRef.current.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      lobbyScannerStreamRef.current = stream;
      if (lobbyScannerVideoRef.current) {
        lobbyScannerVideoRef.current.srcObject = stream;
      }
      setIsLobbyCameraStreaming(true);
    } catch (e: any) {
      console.warn("Lobby scanner camera acquisition failed:", e);
      setLobbyCameraError("Camera capture blocked. Operating in standard simulation workspace.");
      setIsLobbyCameraStreaming(false);
    }
  };

  const stopLobbyScannerCamera = () => {
    if (lobbyScannerStreamRef.current) {
      lobbyScannerStreamRef.current.getTracks().forEach(track => track.stop());
      lobbyScannerStreamRef.current = null;
    }
    if (lobbyScannerVideoRef.current) {
      lobbyScannerVideoRef.current.srcObject = null;
    }
    setIsLobbyCameraStreaming(false);
  };

  // Auto clean camera resource
  useEffect(() => {
    return () => {
      if (lobbyScannerStreamRef.current) {
        lobbyScannerStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Proactive scanner checkout
  const handleScanCheckout = (visitorId: string) => {
    const cleanId = visitorId.trim().toUpperCase();
    const visitor = visitors.find(v => v.id.toUpperCase() === cleanId);
    if (!visitor) {
      alert(`Scan Failed! Visitor ID "${cleanId}" is not registered in active campus logs.`);
      return false;
    }
    if (visitor.checkOut) {
      alert(`Duplicate Scan! Visitor "${visitor.name}" has already checked out.`);
      return false;
    }

    // High pitch barcode scan register sound
    playScanBeep();

    // Check out with clock stamp
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const time = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    onCheckOutVisitor(visitor.id, time);

    // Flash success notification banner
    setRecentScannedVisitor(`Pass Verified! ${visitor.name} (${visitor.id}) successfully checked out at ${time}.`);
    setTimeout(() => {
      setRecentScannedVisitor(null);
    }, 6000);

    return true;
  };

  // Trigger automatic gate pass generation upon successful check-in submit
  useEffect(() => {
    if (autoOpenPassForLatestName) {
      const match = [...visitors].reverse().find(v => v.name === autoOpenPassForLatestName && !v.checkOut);
      if (match) {
        setSelectedPassVisitor(match);
      }
      setAutoOpenPassForLatestName(null);
    }
  }, [visitors, autoOpenPassForLatestName]);

  const playRegistrationChime = () => {
    if (isAudioMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Dual high-pitch warm reception chime
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
      
      // Delay second tone
      const oscillator2 = audioCtx.createOscillator();
      const gainNode2 = audioCtx.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioCtx.destination);
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
      gainNode2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.12);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      
      oscillator2.start(audioCtx.currentTime + 0.12);
      oscillator2.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn("Chime Web Audio playback blocked or uninitialized:", e);
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await window.Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          new window.Notification("Lobby Desktop Notifications Active!", {
            body: "You will now receive instant push updates here when visitors finish checking in.",
          });
        }
      } catch (err) {
        console.error("Failed to request push notification permissions", err);
      }
    }
  };

  // Load default host
  if (!formHostId && staffList.length > 0) {
    setFormHostId(staffList[0].id);
  }

  // AI ID Scan Center states
  const [isScanPanelOpen, setIsScanPanelOpen] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [activeScanTab, setActiveScanTab] = useState<'camera' | 'upload'>('camera');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);

  // Refs for tracking camera stream and file uploading
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Stop device webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScannerActive(false);
  };

  // Start device webcam stream
  const startCamera = async (deviceId?: string) => {
    setScanErrorMsg(null);
    setScanSuccessMsg(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScannerActive(true);

      // Enumerate available camera devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(videoInputs);

      if (videoInputs.length > 0) {
        // Match active device track settings if possible
        const activeTrack = stream.getVideoTracks()[0];
        const settings = activeTrack?.getSettings();
        if (settings?.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        } else if (!selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setScanErrorMsg('Webcam streaming is blocked or not available. Please authorize browser permissions, or switch to "Upload Mode".');
    }
  };

  // Capture frame from canvas stream and scan
  const handleCaptureScan = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    setScanErrorMsg(null);
    setScanSuccessMsg(null);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context rendering failed.');
      }

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/png');

      // Post base64 data to backend
      const response = await fetch('/api/scan-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Gemini smart core extraction failed.');
      }

      // Auto-fill state fields!
      if (result.name) setFormName(result.name);
      if (result.phoneSpelled) setFormPhone(result.phoneSpelled);
      if (result.idType) setFormIdProvided(result.idType);
      
      const parts = ['Auto-filled via Smart-ID Scan.'];
      if (result.notes) parts.push(`Doc notes: ${result.notes}`);
      setFormNotes(parts.join(' '));

      setScanSuccessMsg(`Read details for "${result.name}" successfully!`);
      stopCamera();

    } catch (err: any) {
      console.error('Scan capture error:', err);
      setScanErrorMsg(err.message || 'Unable to scan ID card. Ensure text is clearly legible.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert uploaded/dropped file to base64 and process
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScanErrorMsg('Unsupported file type. Please drag or upload an ID card image file.');
      return;
    }

    setIsAnalyzing(true);
    setScanErrorMsg(null);
    setScanSuccessMsg(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

      const base64Image = await base64Promise;

      const response = await fetch('/api/scan-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Gemini smart core extraction failed.');
      }

      // Auto-fill state fields!
      if (result.name) setFormName(result.name);
      if (result.phoneSpelled) setFormPhone(result.phoneSpelled);
      if (result.idType) setFormIdProvided(result.idType);

      const parts = ['Auto-filled via Smart-ID Scan.'];
      if (result.notes) parts.push(`Doc notes: ${result.notes}`);
      setFormNotes(parts.join(' '));

      setScanSuccessMsg(`Extracted details for "${result.name}" successfully!`);

    } catch (err: any) {
      console.error('File scan error:', err);
      setScanErrorMsg(err.message || 'Unable to extract data from image. Ensure text is clearly visible.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Close helper
  const closeNewVisitorModal = () => {
    stopCamera();
    setIsScanPanelOpen(false);
    setScanErrorMsg(null);
    setScanSuccessMsg(null);
    setIsAutoFilledByHistory(false);
    setIsNewVisitorOpen(false);
  };

  // Filter list
  const filteredVisitors = visitors.filter(vis => 
    vis.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    vis.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group visitors by phone to identify recurring patterns
  const uniquePastVisitors = React.useMemo(() => {
    const map = new Map<string, {
      name: string;
      phone: string;
      idProvided: string;
      notes?: string;
      lastVisited: string;
      totalVisits: number;
    }>();

    // Loop from oldest to newest to capture most recent details but count total visits
    visitors.forEach(vis => {
      // Normalize to prevent mismatch because of formats
      const normalizedPhone = vis.phone.trim().replace(/[-\s()]/g, '');
      const existing = map.get(normalizedPhone);
      if (existing) {
        existing.name = vis.name; // Use latest name
        existing.idProvided = vis.idProvided; // Use latest ID type
        existing.notes = vis.notes;
        existing.lastVisited = vis.date;
        existing.totalVisits += 1;
      } else {
        map.set(normalizedPhone, {
          name: vis.name,
          phone: vis.phone,
          idProvided: vis.idProvided,
          notes: vis.notes,
          lastVisited: vis.date,
          totalVisits: 1,
        });
      }
    });

    return Array.from(map.values());
  }, [visitors]);

  // Filter the recurring list based on phone number search typed or clicked
  const filteredHistory = React.useMemo(() => {
    const q = historySearchPhone.replace(/[-\s()]/g, '').toLowerCase();
    return uniquePastVisitors.filter(p => {
      const normPhone = p.phone.replace(/[-\s()]/g, '').toLowerCase();
      const normName = p.name.toLowerCase();
      return normPhone.includes(q) || normName.includes(q);
    });
  }, [uniquePastVisitors, historySearchPhone]);

  // Handle saving new visitor entry
  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Please fill out Title Name and Phone Contacts before proceeding.');
      return;
    }

    const host = staffList.find(s=>s.id === formHostId);
    const hostName = host ? host.name : 'Eleanor Vance';
    const hostRole = host ? host.role : 'Administrator';

    onAddVisitor({
      name: formName,
      phone: formPhone,
      purpose: formPurpose,
      hostName,
      hostRole,
      checkIn: '09:12 AM', // Mock current time matching 09:11Z locale
      date: '2026-05-24', // system today
      idProvided: formIdProvided,
      notes: formNotes
    });

    // Generate toast alert notification
    const toastId = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [
      {
        id: toastId,
        visitorName: formName,
        hostName,
        message: formPurpose
      },
      ...prev
    ]);

    // Acoustic alarm signal chime
    playRegistrationChime();

    // Trigger standard native OS notifications
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification("Visitor Checked-In Successfully", {
          body: `${formName} has completed lobby reception check-in to meet ${hostName} (${hostRole}).`,
          tag: 'visitor-check-in'
        });
      } catch (err) {
        console.warn("Desktop notification generation failed:", err);
      }
    }

    // Auto-dismiss the toast card after 6 seconds
    setTimeout(() => {
      removeToast(toastId);
    }, 6000);

    // Auto-open check-in QR pass
    setAutoOpenPassForLatestName(formName);

    // Reset fields
    setFormName('');
    setFormPhone('');
    closeNewVisitorModal();
  };

  // Perform instant checkout logic
  const handleCheckOut = (id: string) => {
    onCheckOutVisitor(id, '09:30 AM'); // mock checkout time matching system date
  };

  return (
    <div className="space-y-6" id="visitor-module-container text-slate-705">
      {/* Title Header summary bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1E293B] p-6 rounded-2xl shadow-lg shadow-black/20 border border-[#334155]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="text-[#2563EB] w-6 h-6" />
            Digital Visitor Log & Lobby Registry
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5 font-sans">Streamline front-desk security check-ins, record visitor state purposes, and verify exit timestamps.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto" id="lobby-audio-notifications-controls">
          {/* Audio Chime Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${isAudioMuted ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 border-rose-200 text-[#EF4444] hover:bg-rose-100' : 'bg-[#111827] border-[#334155] text-[#CBD5E1] hover:bg-[#273549]'}`}
            title={isAudioMuted ? "Unmute reception arrival chime" : "Mute reception arrival chime"}
            id="btn-toggle-lobby-chime"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />}
            <span className="hidden md:inline">{isAudioMuted ? "Chime Muted" : "Chime Active"}</span>
          </button>

          {/* HTML5 Push Notification Status Toggle */}
          {typeof window !== 'undefined' && 'Notification' in window && (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                notificationPermission === 'granted'
                  ? 'bg-[#10B981]/10 border border-[#10B981]/30 border-emerald-200 text-[#10B981] font-bold'
                  : notificationPermission === 'denied'
                  ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/30 border-amber-200 text-[#F59E0B]'
                  : 'bg-[#2563EB]/10 border border-[#2563EB]/30 border-indigo-200 text-[#38BDF8] hover:bg-[#2563EB]/20 animate-pulse'
              }`}
              title="Click to toggle or request Desktop notifications"
              id="btn-toggle-desktop-alerts"
            >
              <Bell className={`w-4 h-4 ${notificationPermission === 'granted' ? 'text-emerald-500 animate-bounce' : ''}`} />
              <span className="hidden md:inline">
                {notificationPermission === 'granted'
                  ? 'Desktop Alerts On'
                  : notificationPermission === 'denied'
                  ? 'Alerts Blocked (Locked)'
                  : 'Enable Desktop Alerts'}
              </span>
            </button>
          )}

          <button 
            id="btn-add-visitor"
            onClick={() => {
              setFormName('');
              setFormPhone('');
              setIsAutoFilledByHistory(false);
              setIsNewVisitorOpen(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-lg shadow-black/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Visitor Check-In
          </button>
        </div>
      </div>

      {/* Tab Segment Switches */}
      <div className="flex bg-[#273549] p-1 rounded-xl w-full sm:w-fit" id="visitor-tab-switches">
        <button
          onClick={() => setActiveMainTab('logs')}
          id="tab-btn-visitor-logs"
          className={`flex-1 sm:flex-initial text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all ${activeMainTab === 'logs' ? 'bg-[#1E293B] text-[#38BDF8] shadow-lg shadow-black/20' : 'text-[#94A3B8] hover:text-white'}`}
        >
          Active Lobby Logs
        </button>
        <button
          onClick={() => setActiveMainTab('history')}
          id="tab-btn-visitor-history"
          className={`flex-1 sm:flex-initial text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${activeMainTab === 'history' ? 'bg-[#1E293B] text-[#38BDF8] shadow-lg shadow-black/20' : 'text-[#94A3B8] hover:text-white'}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Visitor History & Auto-Fill
        </button>
      </div>

      {activeMainTab === 'logs' ? (
        <>
          {/* Query filtration bar */}
          <div className="bg-[#1E293B] p-5 rounded-2xl shadow-lg shadow-black/20 border border-[#334155] flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in" id="visitor-filters">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
              <input 
                type="text"
                id="visitors-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visitor logs by name or meeting purpose..."
                className="w-full bg-[#111827] pl-10 pr-4 py-2 text-xs rounded-xl border border-[#334155] focus:bg-[#1E293B] outline-hidden focus:border-indigo-505 transition-all text-[#CBD5E1] font-medium"
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => {
                  const newOpen = !isLobbyScannerOpen;
                  setIsLobbyScannerOpen(newOpen);
                  if (newOpen) {
                    startLobbyScannerCamera();
                  } else {
                    stopLobbyScannerCamera();
                  }
                }}
                className={`flex gap-1.5 items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isLobbyScannerOpen 
                    ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] border-emerald-350 shadow-lg shadow-black/20 font-extrabold'
                    : 'bg-[#111827] hover:bg-[#273549] text-[#CBD5E1] border-[#334155]'
                }`}
              >
                <QrCode className={`w-4 h-4 ${isLobbyScannerOpen ? 'text-[#10B981] animate-pulse' : 'text-[#2563EB]'}`} />
                <span>Touchless Check-Out Station</span>
              </button>
            </div>
          </div>

          <style>{`
            @keyframes qrlaser {
              0% { top: 0% }
              50% { top: 100% }
              100% { top: 0% }
            }
            .animate-qr-laser {
              animation: qrlaser 2.5s infinite ease-in-out;
            }
          `}</style>

          {/* Dedicated Touchless Checkout Scan Station */}
          {isLobbyScannerOpen && (
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5 animate-fade-in" id="lobby-touchless-scan-station">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/300 animate-pulse"></div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">
                      Gate Guard Terminal: Touchless QR Check-Out Station
                    </h3>
                    <p className="text-[11px] text-slate-450 mt-0.5">Instantly sign out visitors by flashing their pass QR code in front of the lens.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLobbyScannerOpen(false);
                    stopLobbyScannerCamera();
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-[#94A3B8] hover:text-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status scan successful toast flash */}
              {recentScannedVisitor && (
                <div className="bg-[#10B981]/10 border border-[#10B981]/300/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-sans font-bold flex items-center gap-2.5 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 font-extrabold" />
                  <span>{recentScannedVisitor}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Visual Viewport Left Side */}
                <div className="lg:col-span-5 bg-slate-950 rounded-xl relative overflow-hidden h-48 border border-slate-800 flex flex-col items-center justify-center p-4">
                  
                  {/* Glowing Laser Scan beam line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#10B981]/10 border border-[#10B981]/300 shadow-[0_0_8px_rgb(16,185,129)] animate-qr-laser z-10"></div>
                  
                  {/* Decorative corner crosshair brackets */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-slate-600"></div>
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-slate-600"></div>
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-slate-600"></div>
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-slate-600"></div>

                  {isLobbyCameraStreaming ? (
                    <video
                      ref={lobbyScannerVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="text-center space-y-2 z-1">
                      <QrCode className="w-8 h-8 text-slate-650 mx-auto animate-pulse" />
                      <p className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-widest font-black">Scanner Laser Active</p>
                      <p className="text-[10px] text-[#94A3B8] px-3">Webcam is off. Present any QR code below to register instant check-out.</p>
                    </div>
                  )}

                  {/* Camera toggler in viewport margin */}
                  <div className="absolute bottom-2.5 right-2.5 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        if (isLobbyCameraStreaming) {
                          stopLobbyScannerCamera();
                        } else {
                          startLobbyScannerCamera();
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-all border border-slate-700"
                    >
                      <Camera className="w-3 h-3" />
                      {isLobbyCameraStreaming ? "Kill Feed" : "Turn Lens On"}
                    </button>
                  </div>

                  {lobbyCameraError && (
                    <div className="absolute inset-x-0 bottom-12 bg-slate-950/90 flex items-center justify-center p-2 text-center z-10">
                      <p className="text-[9.5px] text-amber-500 font-sans font-medium">{lobbyCameraError}</p>
                    </div>
                  )}
                </div>

                {/* Console Controls Right Side */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Manual Keyboard entry or Scanner Barcode Gun trigger */}
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
                      USB Scanner Gun Emulation & Pass Identifier Entry
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <Scan className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
                        <input
                          type="text"
                          value={manualBarcodeScan}
                          onChange={(e) => setManualBarcodeScan(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (manualBarcodeScan.trim()) {
                                handleScanCheckout(manualBarcodeScan);
                                setManualBarcodeScan('');
                              }
                            }
                          }}
                          placeholder="Type or click visitor code (e.g. VIS-01) & press Enter..."
                          className="w-full bg-slate-950 text-emerald-400 font-mono text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 outline-hidden focus:bg-slate-950 transition-all text-slate-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (manualBarcodeScan.trim()) {
                            handleScanCheckout(manualBarcodeScan);
                            setManualBarcodeScan('');
                          }
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0"
                      >
                        Check-Out
                      </button>
                    </div>
                  </div>

                  {/* Simulator Trigger tags */}
                  <div className="space-y-2 mr-2 text-left">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
                        Quick Simulation: Fast-Touch Scanner Beam Tags
                      </span>
                      <span className="text-[9.5px] text-[#CBD5E1] ">Beeps on register!</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {visitors.filter(v => !v.checkOut).map(vis => (
                        <button
                          key={vis.id}
                          type="button"
                          onClick={() => handleScanCheckout(vis.id)}
                          className="px-2.5 py-1.5 bg-slate-850 hover:bg-[#10B981]/10 border border-[#10B981]/300/10 hover:border-emerald-500/30 hover:text-emerald-400 text-slate-300 rounded-lg text-[10.5px] font-bold transition-all border border-slate-800 cursor-pointer flex items-center gap-1.5 font-sans"
                        >
                          <QrCode className="w-3 h-3 text-emerald-500" />
                          <span>{vis.name}</span>
                          <span className="bg-slate-900 px-1 py-0.5 rounded text-[8.5px] text-[#94A3B8] font-mono">{vis.id}</span>
                        </button>
                      ))}
                      {visitors.filter(v => !v.checkOut).length === 0 && (
                        <p className="text-[10px] text-[#94A3B8]  pb-2">No active checked-in visitors currently inside school grounds.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Main Visitor Table Card Grid */}
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] overflow-hidden shadow-lg shadow-black/20" id="visitors-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="visitors-reception-table">
                <thead>
                  <tr className="bg-[#111827] border-b border-[#334155] text-[10.5px] font-mono text-slate-505 uppercase tracking-wider ">
                    <th className="p-4">Visitor Identification</th>
                    <th className="p-4">Phone contact</th>
                    <th className="p-4">Reason for visiting</th>
                    <th className="p-4">Target Meeting Official</th>
                    <th className="p-4">Check-In Timing</th>
                    <th className="p-4">Check-Out Timing</th>
                    <th className="p-4 text-center">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {filteredVisitors.map(vis => {
                    const isActive = !vis.checkOut;
                    
                    return (
                      <tr key={vis.id} className="hover:bg-[#111827] transition-all text-xs" id={`visitor-row-${vis.id}`}>
                        {/* Visitor name */}
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#10B981]/10 border border-[#10B981]/300 animate-pulse' : 'bg-slate-300'}`}></div>
                            <div>
                              <p className="text-white font-bold">{vis.name}</p>
                              <p className="text-[9.5px] text-[#94A3B8] font-mono mt-0.5">ID: {vis.idProvided} • {vis.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Visitors Phone */}
                        <td className="p-4 font-mono text-[#CBD5E1]">
                          {vis.phone}
                        </td>

                        {/* Purpose */}
                        <td className="p-4 text-[#CBD5E1]">
                          <div>
                            <p className="font-medium text-slate-650">{vis.purpose}</p>
                            <p className="text-[10px] text-[#94A3B8]  font-mono mt-0.5">Notes: "{vis.notes}"</p>
                          </div>
                        </td>

                        {/* Target official */}
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-[#CBD5E1]">{vis.hostName}</p>
                            <p className="text-[10.5px] text-slate-405  font-sans">{vis.hostRole}</p>
                          </div>
                        </td>

                        {/* checkIn time */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-[#CBD5E1] font-mono text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                            <span>{vis.checkIn}</span>
                          </div>
                        </td>

                        {/* checkOut time */}
                        <td className="p-4">
                          {isActive ? (
                            <span className="text-[10px] bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                              In Campus
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[#94A3B8] font-mono text-[11px]">
                              <LogOut className="w-3.5 h-3.5" />
                              <span>{vis.checkOut}</span>
                            </div>
                          )}
                        </td>
                        
                        {/* Desk checking out trigger action */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {isActive ? (
                              <>
                                <button
                                  type="button"
                                  id={`btn-gatepass-visitor-${vis.id}`}
                                  onClick={() => setSelectedPassVisitor(vis)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB]/10 border border-[#2563EB]/30 hover:bg-[#2563EB]/20 text-[#38BDF8] font-bold rounded-lg border border-indigo-200 text-[10.5px] transition-all cursor-pointer"
                                  title="View and Print Digital QR Entry Pass"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  QR Pass
                                </button>
                                <button
                                  type="button"
                                  id={`btn-checkout-visitor-${vis.id}`}
                                  onClick={() => handleCheckOut(vis.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-[#EF4444]/10 border border-[#EF4444]/30 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 text-[10.5px] transition-all cursor-pointer"
                                  title="Check-out visitor immediately"
                                >
                                  <LogOut className="w-3.5 h-3.5 animate-pulse" />
                                  Check-Out
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-[10px] text-[#94A3B8] font-mono">
                                <span className="flex items-center gap-1 font-bold text-[#94A3B8] bg-[#273549] px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> Signed Out
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPassVisitor(vis)}
                                  className="text-[9.5px] text-indigo-500 hover:text-[#38BDF8] underline font-sans font-semibold cursor-pointer"
                                  title="View digital gate permit receipt"
                                >
                                  View Receipt Pass
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                  {filteredVisitors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-404  text-xs">
                        No Visitor lobby recordings logged matching query metrics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Visitor History Lookup & Keypad Panel Component */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="visitor-history-tab-view">
          
          {/* LEFT TELEPHONY DIAL KEYPAD */}
          <div className="lg:col-span-4 bg-[#1E293B] p-5 rounded-2xl border border-[#334155] shadow-lg shadow-black/20 flex flex-col justify-between space-y-6" id="keypad-lookup-panel">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" /> LOOKUP INDEX
                </h3>
                <p className="text-xs text-[#94A3B8] font-sans">Type direct customer phone digits or name prefixes to instantly isolate recurring profiles.</p>
              </div>

              {/* Input for Phone/Name query */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  id="history-phone-search-input"
                  value={historySearchPhone}
                  onChange={(e) => setHistorySearchPhone(e.target.value)}
                  placeholder="Type digits or full name..."
                  className="w-full bg-[#111827] pl-10 pr-10 py-3 text-xs rounded-xl border border-slate-205 focus:bg-[#1E293B] outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 transition-all font-semibold font-mono text-slate-750 placeholder:font-sans placeholder:text-[#94A3B8] placeholder:font-normal"
                />
                {historySearchPhone && (
                  <button
                    onClick={() => setHistorySearchPhone('')}
                    className="absolute right-3.5 top-3 hover:text-[#EF4444] text-[#94A3B8] cursor-pointer p-0.5 bg-[#334155] hover:bg-slate-300 rounded-full"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Touchpad Dial Assist */}
              <div className="bg-[#111827]/70 p-4 rounded-xl border border-[#334155] space-y-3">
                <p className="text-[10px] font-mono text-[#94A3B8] font-bold uppercase tracking-wider text-center">Touch Screen Assist Pad</p>
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => setHistorySearchPhone(p => p + digit)}
                      className="py-3 text-xs font-bold bg-[#1E293B] active:bg-slate-250 hover:bg-[#2563EB]/10 border border-[#2563EB]/30 hover:text-indigo-650 hover:border-indigo-200 text-[#CBD5E1] rounded-lg shadow-3xs cursor-pointer border border-[#334155] transition-all font-mono"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setHistorySearchPhone(p => p.slice(0, -1))}
                    className="py-3 text-[10px] font-bold bg-slate-150 hover:bg-[#334155] text-[#CBD5E1] active:bg-slate-300 rounded-lg shadow-3xs cursor-pointer border border-[#334155]/50 transition-all"
                  >
                    ⌫ Back
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setHistorySearchPhone('')}
                  className="w-full py-2 text-[10px] font-bold bg-[#EF4444]/10 border border-[#EF4444]/30 hover:bg-rose-100/80 text-rose-700 active:bg-rose-200 rounded-lg shadow-3xs cursor-pointer transition-all border border-rose-100"
                >
                  Clear Lookup Input
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#334155] text-[10px] text-[#94A3B8] leading-relaxed space-y-1 font-sans">
              <span className="font-semibold block text-[#94A3B8] font-mono">RECURRING PROFILE ENGINE:</span>
              <span>Our system maps historic lobby registers locally. Searching indices permits instantly auto-populating fields, increasing speed by up to 80%.</span>
            </div>
          </div>

          {/* RIGHT RECURRING MATCH RESULTS */}
          <div className="lg:col-span-8 bg-[#1E293B] p-5 rounded-2xl border border-[#334155] shadow-lg shadow-black/20 space-y-4" id="recurring-matches-panel">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <div>
                <h3 className="text-xs font-bold text-slate-405 uppercase tracking-wider mb-0.5">
                  Matched Recurring Profiles ({filteredHistory.length})
                </h3>
                <p className="text-xs text-[#94A3B8] font-sans">Select any past visitor profile to trigger secure check-in auto-fill.</p>
              </div>
              
              <button
                onClick={() => {
                  setFormName('');
                  setFormPhone('');
                  setIsAutoFilledByHistory(false);
                  setIsNewVisitorOpen(true);
                }}
                className="px-3 py-1.5 bg-[#2563EB]/10 border border-[#2563EB]/30 hover:bg-[#2563EB]/20 text-indigo-750 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-indigo-200/40"
              >
                <Plus className="w-3.5 h-3.5" />
                Register New Visitor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
              {filteredHistory.map((vis, pIdx) => {
                const bgColors = [
                  'bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#38BDF8] border-indigo-100',
                  'bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] border-emerald-100',
                  'bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-amber-500 border-amber-100',
                  'bg-cyan-50 text-cyan-705 border-cyan-100',
                  'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100'
                ];
                const activeColor = bgColors[vis.name.length % bgColors.length];
                const monogram = vis.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'V';

                return (
                  <div
                    key={`${vis.phone}-${pIdx}`}
                    id={`profile-card-${vis.phone}`}
                    className="p-4 border border-[#334155] rounded-xl hover:border-indigo-300 bg-[#111827]/25 hover:bg-[#1E293B] hover:shadow-lg shadow-black/20 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-xs border shrink-0 ${activeColor}`}>
                        {monogram}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white group-hover:text-[#38BDF8] transition-colors text-xs truncate max-w-full">{vis.name}</h4>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#2563EB] rounded-md shrink-0">
                            {vis.totalVisits} {vis.totalVisits === 1 ? 'visit' : 'visits'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono font-medium text-[#94A3B8]">{vis.phone}</p>
                        <p className="text-[10px] text-[#94A3B8] truncate">
                          ID: <span className="font-semibold text-[#CBD5E1]">{vis.idProvided}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#334155]/60 flex items-center justify-between text-[10px]">
                      <span className="text-[#94A3B8] font-sans">
                        Last Active: <span className="font-medium text-[#94A3B8]">{vis.lastVisited}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setFormName(vis.name);
                          setFormPhone(vis.phone);
                          setFormIdProvided(vis.idProvided);
                          setFormNotes(`Auto-filled from Visitor History records. Total Past Visits: ${vis.totalVisits}.`);
                          setIsAutoFilledByHistory(true);
                          setIsNewVisitorOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-200" />
                        Auto-fill Profile
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="col-span-1 md:col-span-2 p-10 text-center rounded-xl border border-dashed border-slate-205 bg-[#111827] space-y-3">
                  <p className="text-xs text-slate-505  font-medium">No recurring profile matches your lookup.</p>
                  <p className="text-[10.5px] text-[#94A3B8]">Search with another contact number digits index or name, or register a new face check-in from scratch.</p>
                  <button
                    onClick={() => {
                      setFormName('');
                      setFormPhone('');
                      setIsAutoFilledByHistory(false);
                      setIsNewVisitorOpen(true);
                    }}
                    className="inline-block px-4 py-1.5 bg-[#1E293B] border border-[#334155] text-[#2563EB] hover:text-white hover:bg-indigo-650 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-3xs"
                  >
                    Register Brand New Visitor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY VISITOR: LOBBY CHECKIN REGISTER FORM */}
      {isNewVisitorOpen && (
        <div className="fixed inset-0 z-55 bg-slate-905/40 backdrop-blur-xs flex items-center justify-center p-4" id="visitor-creation-modal">
          <div className={`bg-[#1E293B] rounded-2xl w-full ${isScanPanelOpen ? 'max-w-3xl' : 'max-w-md'} shadow-2xl border border-[#334155] flex flex-col transition-all duration-300`}>
            
            <div className="p-5 border-b border-[#334155] bg-[#111827] rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Register Lobby Visitor
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 font-sans">Acquire details for ID badge printouts.</p>
              </div>
              {!isScanPanelOpen && (
                <button
                  type="button"
                  id="btn-trigger-smart-scan"
                  onClick={() => {
                    setIsScanPanelOpen(true);
                    setActiveScanTab('camera');
                    startCamera();
                  }}
                  className="px-3 py-1.5 bg-[#2563EB]/10 border border-[#2563EB]/30 hover:bg-[#2563EB]/20 text-[#2563EB] hover:text-[#38BDF8] text-xs font-bold rounded-lg border border-indigo-200/50 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 animate-pulse" />
                  Smart Scan ID
                </button>
              )}
            </div>

            {isAutoFilledByHistory && (
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 border-b border-emerald-100 px-5 py-3 text-xs text-[#10B981] flex items-start justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 font-extrabold" />
                  <div>
                    <span className="font-bold block text-[#10B981] font-sans">Recurring visitor profile auto-filled</span>
                    <span className="text-[10.5px] text-[#10B981] block mt-0.5">Loaded name, mobile, and primary credentials from past history register.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormName('');
                    setFormPhone('');
                    setIsAutoFilledByHistory(false);
                  }}
                  className="text-[10px] text-[#10B981] hover:text-emerald-900 underline font-sans font-bold cursor-pointer shrink-0"
                >
                  Clear Fields
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#334155]">
              
              {/* LEFT HALF DESIGN: CAMERA SCANNER INTERFACE */}
              {isScanPanelOpen && (
                <div className="w-full md:w-1/2 p-5 bg-[#111827]/70 flex flex-col justify-between" id="ai-id-scanner-panel">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-650 flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                        AI ID Document scanner
                      </h4>
                      
                      <div className="flex items-center gap-1 bg-[#1E293B] border border-[#334155] rounded-lg p-0.5 shadow-3xs" id="scanner-tabs">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveScanTab('camera');
                            startCamera();
                          }}
                          className={`px-2.5 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                            activeScanTab === 'camera' ? 'bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] text-white shadow-3xs' : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveScanTab('upload');
                            stopCamera();
                          }}
                          className={`px-2.5 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                            activeScanTab === 'upload' ? 'bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] text-white shadow-3xs' : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Upload File
                        </button>
                      </div>
                    </div>

                    {activeScanTab === 'camera' ? (
                      <div className="space-y-3">
                        {/* CAMERA LIST SELECTOR FOR SWITCHING FRONT/REAR */}
                        {videoDevices.length > 1 && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] font-sans">
                            <RotateCw className="w-3 h-3 text-[#94A3B8] rotate-180" />
                            <span>Switch Source:</span>
                            <select
                              value={selectedDeviceId}
                              onChange={(e) => {
                                setSelectedDeviceId(e.target.value);
                                startCamera(e.target.value);
                              }}
                              className="bg-[#1E293B] border border-slate-205 rounded-md px-2 py-0.5 focus:outline-hidden text-[10.5px] font-medium text-[#CBD5E1]"
                            >
                              {videoDevices.map((dev, dIdx) => (
                                <option key={dev.deviceId} value={dev.deviceId}>
                                  {dev.label || `Camera ${dIdx + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* LIVE WEBCAM TARGET FRAME */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-[#334155]/85 shadow-md flex items-center justify-center">
                          {isScannerActive ? (
                            <>
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />

                              {/* DASHED DOCUMENT FOCUS GUIDE */}
                              <div className="absolute inset-4 border-2 border-dashed border-indigo-400/50 rounded-lg pointer-events-none flex items-center justify-center bg-transparent">
                                <div className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-indigo-200 rounded-md mt-16 font-mono text-center shadow-xl shadow-black/40">
                                  Position ID Card
                                </div>
                              </div>

                              {/* LASER LINE ANIMATION */}
                              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                <div className="absolute left-0 w-full h-0.5 bg-[#2563EB]/10 border border-[#2563EB]/300 opacity-90 shadow-[0_0_8px_#3b82f6] animate-scan-line"></div>
                              </div>

                              {/* LIVE CORNER GLOW */}
                              <div className="absolute top-2.5 right-2.5 text-[9px] font-mono bg-[#10B981]/10 border border-[#10B981]/300 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[#1E293B] rounded-full animate-ping"></span> Webcam Online
                              </div>
                            </>
                          ) : (
                            <div className="p-5 text-center space-y-3 bg-slate-950/95 w-full h-full flex flex-col justify-center items-center">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[#94A3B8] border border-slate-700">
                                <Camera className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-slate-200">Device Video Offline</p>
                                <p className="text-[9.5px] text-[#94A3B8] max-w-[200px] mt-0.5 mx-auto leading-relaxed">Please grant camera hardware frame authorizations to activate.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => startCamera()}
                                className="px-3 py-1.5 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white text-[10.5px] rounded-lg shadow-xl shadow-black/40 font-bold transition-all cursor-pointer"
                              >
                                Activate Webcam
                              </button>
                            </div>
                          )}
                        </div>

                        {/* DESK CONTROLS */}
                        {isScannerActive && (
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              disabled={isAnalyzing}
                              onClick={handleCaptureScan}
                              className="px-4 py-2 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 disabled:bg-indigo-750 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-black/20 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              {isAnalyzing ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Extracting ID...
                                </>
                              ) : (
                                <>
                                  <Camera className="w-3.5 h-3.5" />
                                  Capture ID Document
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-3 py-2 bg-[#334155] hover:bg-slate-300 text-[#CBD5E1] rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Stop Feed
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* MANUAL DRAG DROP CAPTURE AS ALTERNATIVE */
                      <div className="space-y-3">
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center aspect-video ${
                            dragActive ? 'border-indigo-500 bg-[#2563EB]/10 border border-[#2563EB]/30/40' : 'border-[#334155] hover:border-indigo-400 hover:bg-[#111827]'
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          {isAnalyzing ? (
                            <div className="space-y-2">
                              <RefreshCw className="w-7 h-7 text-[#2563EB] animate-spin mx-auto" />
                              <p className="text-[11px] font-bold text-white">Processing image via Gemini Vision...</p>
                              <p className="text-[9.5px] text-[#94A3B8]">Extracting visitor full names and document matches.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-9 h-9 rounded-full bg-[#273549] flex items-center justify-center mx-auto text-[#94A3B8]">
                                <Upload className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-[#CBD5E1]">Drag & Drop ID Card Image</p>
                                <p className="text-[9.5px] text-[#94A3B8] mt-0.5">Supports barcode credentials or physical badges</p>
                              </div>
                              <span className="inline-block text-[10px] text-[#2563EB] font-semibold bg-[#2563EB]/10 border border-[#2563EB]/30 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                                Browse Image File
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STATUS TOAST LABELS */}
                    {(scanErrorMsg || scanSuccessMsg) && (
                      <div className="animate-fade-in">
                        {scanErrorMsg && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10.5px] text-red-700 flex items-start gap-1.5 animate-pulse">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                            <span>{scanErrorMsg}</span>
                          </div>
                        )}
                        {scanSuccessMsg && (
                          <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 border border-emerald-100 rounded-xl text-[10.5px] text-[#10B981] flex items-start gap-1.5 shadow-2xs">
                            <Check className="w-4 h-4 shrink-0 text-[#10B981] font-extrabold" />
                            <span>{scanSuccessMsg}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#334155]/60 flex items-start gap-1.5 text-[9.5px] text-[#94A3B8] mt-4 leading-normal">
                    <Info className="w-3.5 h-3.5 shrink-0 text-[#94A3B8] mt-0.5" />
                    <span>Real-time local OCR extracts only factual ID text. No document copies are stored server-side to enforce total privacy compliance rules.</span>
                  </div>
                </div>
              )}

              {/* RIGHT HALF DESIGN: VISITORS GENERAL INPUT FORM */}
              <form onSubmit={handleCreateVisitor} className={`p-5 space-y-4 text-xs font-sans text-slate-705 ${isScanPanelOpen ? 'w-full md:w-1/2' : 'w-full'}`}>
              {/* Full name */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Visitor Full Name *</label>
                <input 
                  type="text"
                  required
                  id="form-visitor-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#CBD5E1] font-medium focus:border-indigo-500 focus:bg-[#1E293B] outline-hidden transition-all"
                />
              </div>

              {/* Phone Contacts */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Visitor Mobile Contact Phone *</label>
                <input 
                  type="text"
                  required
                  id="form-visitor-phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs font-mono focus:border-indigo-505"
                />
              </div>

              {/* ID Provided selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Government ID Credentials provided</label>
                <select
                  id="form-visitor-id-type"
                  value={formIdProvided}
                  onChange={(e) => setFormIdProvided(e.target.value)}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-slate-705"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card (National Tax ID)</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID Card</option>
                  <option value="Parent Association Card">Parent ID / Association Card</option>
                </select>
              </div>

              {/* Target check-in host official */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Meeting Host official *</label>
                <select
                  id="form-visitor-host"
                  value={formHostId}
                  onChange={(e) => setFormHostId(e.target.value)}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-slate-705"
                >
                  {staffList.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.designation})</option>
                  ))}
                </select>
              </div>

              {/* Meeting Reason Purpose */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Meeting Reason Purpose *</label>
                <input 
                  type="text"
                  required
                  id="form-visitor-purpose"
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Discuss Student Calculus progress grade"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-slate-705"
                />
              </div>

              {/* Descriptive memo notes */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Logbook Notes</label>
                <input 
                  type="text"
                  id="form-visitor-notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Signed check-in badge"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-slate-705"
                />
              </div>

              <div className="pt-4 border-t border-[#334155] flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-visitor-log"
                  onClick={closeNewVisitorModal}
                  className="px-4 py-2 border border-[#334155] text-[#94A3B8] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-visitor-log"
                  className="px-5 py-2 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-black/20 cursor-pointer"
                >
                  Approve Lobby Access
                </button>
              </div>

            </form>
          </div>
          </div>
        </div>
      )}

      {/* FLOAT ALERTS PANEL DESIGN: TOAST WRAP */}
      <div className="fixed bottom-5 right-5 z-90 space-y-3 max-w-sm w-full pointer-events-none" id="lobby-toasters-panel">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`lobby-toast-${toast.id}`}
            className="pointer-events-auto bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start justify-between relative overflow-hidden transition-all duration-300 transform translate-y-0 scale-100 font-sans shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-l-4 border-l-indigo-505 animate-slide-in"
          >
            {/* Visual glow indicator */}
            <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/300/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
              <BellRing className="w-4 h-4 text-indigo-400 animate-bounce" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-[#2563EB]/10 border border-[#2563EB]/300/20 text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Visitor Checked-In
                </span>
                <span className="text-[9px] text-[#94A3B8] font-mono">Just Now</span>
              </div>
              <h4 className="font-bold text-slate-100 text-xs leading-normal select-all">
                {toast.visitorName}
              </h4>
              <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                Has registered to meet <span className="font-semibold text-slate-100">{toast.hostName}</span>.
              </p>
              
              {/* Timing or note details */}
              {toast.message && (
                <p className="text-[10px] text-[#94A3B8] ">
                  "{toast.message}"
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-[#94A3B8] hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95"
              title="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Self-destruction time progress visual indicator line */}
            <div className="absolute bottom-0 left-0 h-1 bg-[#2563EB]/10 border border-[#2563EB]/300 animate-toast-progress"></div>
          </div>
        ))}
      </div>

      {/* DIGITAL VISITOR ENTRY PASS MODAL (WITH QR CODE) */}
      {selectedPassVisitor && (
        <div className="fixed inset-0 z-60 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="visitor-gatepass-modal">
          <div className="bg-[#1E293B] rounded-3xl w-full max-w-sm shadow-2xl border border-[#334155] flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Visual Header Panel with CBSE Style Ribbon */}
            <div className="bg-indigo-900 px-6 py-4 text-white text-center relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-400"></div>
              <h3 className="text-xs font-black tracking-widest uppercase mt-1">EduQube Access Security</h3>
              <p className="text-[9px] font-mono text-indigo-200 tracking-widest mt-0.5 uppercase">Digital Visitor Entry Permit</p>
              
              <button
                type="button"
                onClick={() => setSelectedPassVisitor(null)}
                className="absolute right-4 top-4 hover:bg-[#1E293B]/10 p-1 rounded-full text-indigo-200 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Gate Pass Body Card */}
            <div className="p-6 flex-grow overflow-y-auto space-y-4 text-white text-left" id="print-pass-area">
              
              {/* Status Indicator Stamp Header */}
              <div className="flex justify-between items-start border-b border-dashed border-[#334155] pb-3">
                <div>
                  <h4 className="font-extrabold text-white text-xs uppercase tracking-wide">CAMPUS GATE PERMIT</h4>
                  <p className="text-[9px] text-[#94A3B8] font-sans tracking-wide mt-0.5">Dwarka Institutional Campus, ND</p>
                </div>
                <div>
                  {selectedPassVisitor.checkOut ? (
                    <span className="bg-[#273549] text-[#94A3B8] border border-[#334155] text-[8.5px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      Checked-Out Exit
                    </span>
                  ) : (
                    <span className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] border border-emerald-250 text-[8.5px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/300 inline-block"></span> Gate: Active Inside
                    </span>
                  )}
                </div>
              </div>

              {/* High Quality SCANNABLE QR CODE Frame */}
              <div className="flex flex-col items-center justify-center space-y-2 bg-[#111827] p-4 rounded-2xl border border-[#334155]">
                <div className="bg-[#1E293B] p-2.5 rounded-xl shadow-lg shadow-black/20 border border-[#334155] flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `${window.location.origin}${window.location.pathname}?checkoutVisitorId=${selectedPassVisitor.id}`
                    )}`}
                    alt={`QR Code Pass for visitor ${selectedPassVisitor.id}`}
                    className="w-36 h-36 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center font-mono font-bold">
                  <p className="text-[9px] text-[#94A3B8] tracking-widest uppercase">Pass Reference Code</p>
                  <h5 className="text-xs font-black text-indigo-800 tracking-wider mt-0.5 uppercase">{selectedPassVisitor.id}</h5>
                </div>
              </div>

              {/* Visitor Profile Grid parameters */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 bg-[#111827] p-3 rounded-xl text-left border border-[#334155] text-[10.5px]">
                <div>
                  <p className="text-[8.5px] text-[#94A3B8] uppercase tracking-wider font-semibold">Visitor Name</p>
                  <p className="font-bold text-white truncate">{selectedPassVisitor.name}</p>
                </div>
                <div>
                  <p className="text-[8.5px] text-[#94A3B8] uppercase tracking-wider font-semibold">Contact Mobile</p>
                  <p className="font-mono text-[#CBD5E1]">{selectedPassVisitor.phone}</p>
                </div>
                <div className="col-span-2 border-t border-[#334155]/30 pt-1.5">
                  <p className="text-[8.5px] text-[#94A3B8] uppercase tracking-wider font-semibold">Target Official</p>
                  <p className="font-bold text-white truncate">
                    {selectedPassVisitor.hostName} <span className="text-[9.5px] text-slate-450 font-normal">({selectedPassVisitor.hostRole})</span>
                  </p>
                </div>
                <div className="col-span-2 border-t border-[#334155]/30 pt-1.5">
                  <p className="text-[8.5px] text-[#94A3B8] uppercase tracking-wider font-semibold">Access Purpose</p>
                  <p className="font-medium text-[#CBD5E1] truncate">{selectedPassVisitor.purpose}</p>
                </div>
                <div className="border-t border-[#334155]/30 pt-1.5">
                  <p className="text-[8.5px] text-[#94A3B8] uppercase tracking-wider font-semibold">Campus Check-In</p>
                  <p className="font-mono text-[#CBD5E1] text-[9.5px]">{selectedPassVisitor.checkIn}</p>
                </div>
                <div className="border-t border-[#334155]/30 pt-1.5">
                  <p className="text-[8.5px] text-[#94A3B8] uppercase tracking-wider font-semibold">Campus Check-Out</p>
                  <p className="font-mono text-[9.5px] text-[#EF4444] font-bold">
                    {selectedPassVisitor.checkOut ? selectedPassVisitor.checkOut : 'Authorized Entry'}
                  </p>
                </div>
              </div>

              {/* Signature and instruction */}
              <div className="text-[9.5px] text-slate-450 text-center space-y-1.5 bg-[#111827]/20 p-2.5 rounded-lg border border-[#334155]/50">
                <p>Scan this pass above with any smartphone camera instantly at exit gates to perform touchless digital check-out.</p>
                <div className="w-1/3 border-t border-dashed border-[#334155] mx-auto pt-1 text-[9.5px] font-sans font-semibold text-[#94A3B8] uppercase tracking-wide">
                  Gate Security Log
                </div>
              </div>

            </div>

            {/* Action button bar */}
            <div className="p-4 bg-[#111827] border-t border-[#334155] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-grow flex items-center justify-center gap-1 px-3.5 py-2.5 bg-[#273549] hover:bg-[#334155] text-[#CBD5E1] font-bold rounded-xl text-xs transition-all cursor-pointer border border-[#334155]"
              >
                <Printer className="w-4 h-4" />
                Print Pass
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedPassVisitor.checkOut) {
                    // Simulate scan checking out
                    const successful = handleScanCheckout(selectedPassVisitor.id);
                    if (successful) {
                      // Update modal state matching scanned results
                      setSelectedPassVisitor(prev => {
                        if (!prev) return null;
                        const now = new Date();
                        const hours = now.getHours();
                        const minutes = now.getMinutes().toString().padStart(2, '0');
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        const hour12 = hours % 12 || 12;
                        const time = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                        return { ...prev, checkOut: time };
                      });
                    }
                  } else {
                    alert("Visitor is already checked out of school bounds!");
                  }
                }}
                className={`flex-grow flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-white font-bold rounded-xl text-xs transition-all cursor-pointer ${
                  selectedPassVisitor.checkOut
                    ? 'bg-slate-300 border-slate-300 text-[#94A3B8] cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-black/40 animate-pulse'
                }`}
                disabled={!!selectedPassVisitor.checkOut}
              >
                <Scan className="w-4 h-4" />
                {selectedPassVisitor.checkOut ? "Checked Out" : "Simulate Scan"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
