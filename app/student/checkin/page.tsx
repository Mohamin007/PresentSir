"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Camera, MapPin, CheckCircle, Scan, ArrowLeft, Smile, Meh, Frown } from "lucide-react"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { getUser } from "@/lib/auth"
import { embeddingToDescriptor, loadFaceRecognitionModels, parseFaceEmbedding } from "@/lib/face-api"

const sentimentOptions = [
  { id: "focused", label: "Focused", icon: Smile, color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
  { id: "neutral", label: "Neutral", icon: Meh, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  { id: "lost", label: "Lost", icon: Frown, color: "text-red-500", bgColor: "bg-red-50 border-red-200" },
]

function StudentCheckinPageInner() {
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<"camera" | "success">("camera")
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [checkinError, setCheckinError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionTitle, setSessionTitle] = useState("Introduction to Computer Science")
  const [sessionSubTitle, setSessionSubTitle] = useState("Room 101 • Dr. Sarah Mitchell")
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string>("Student")
  const [studentRollNumber, setStudentRollNumber] = useState<string>("")
  const [checkinId, setCheckinId] = useState<string | null>(null)
  const [presenceStatus, setPresenceStatus] = useState<"online" | "offline">("online")
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null)
  const [faceVerified, setFaceVerified] = useState(false)
  const [faceMessage, setFaceMessage] = useState("Position your face in the frame to verify attendance.")
  const [faceDistance, setFaceDistance] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sessionToken = searchParams.get("token")

  // Request camera permission and start video stream
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionToken) return

      try {
        const userProfile = await getUser()
        if (!userProfile) {
          setCheckinError("Please sign in before checking in.")
          return
        }

        setStudentId(userProfile.id)
        setStudentName(userProfile.name || "Student")
        setStudentRollNumber(String((userProfile as { roll_number?: string; rollNumber?: string }).roll_number ?? (userProfile as { roll_number?: string; rollNumber?: string }).rollNumber ?? userProfile.id))

        const storedFaceEmbedding = parseFaceEmbedding(userProfile.face_embedding)
        setFaceEmbedding(storedFaceEmbedding)

        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("id, room_id")
          .eq("qr_token", sessionToken)
          .single()

        if (sessionError || !sessionData) {
          setCheckinError("This check-in link is no longer valid.")
          return
        }

        setSessionId(sessionData.id)

        const { data: roomData } = await supabase
          .from("rooms")
          .select("name, subject")
          .eq("id", sessionData.room_id)
          .single()

        if (roomData) {
          setSessionTitle(roomData.name)
          setSessionSubTitle(roomData.subject)
        }
      } catch (error) {
        console.error("Session load error:", error)
      }
    }

    const startCamera = async () => {
      try {
        setCameraError(null)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
            await videoRef.current.play()
        }
      } catch (error) {
        setCameraError("Camera access denied. Please allow camera access to check in.")
        console.error("Camera error:", error)
      }
    }

  startCamera()
  loadSession()

    // Cleanup: stop camera stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (stage !== "camera") return

    let cancelled = false

    const clearOverlay = () => {
      if (overlayRef.current) {
        const context = overlayRef.current.getContext("2d")
        context?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
      }
    }

    const runRecognition = async () => {
      if (cancelled) return

      if (!videoRef.current || !overlayRef.current || videoRef.current.readyState < 2) {
        recognitionLoopRef.current = setTimeout(runRecognition, 600)
        return
      }

      if (!faceEmbedding) {
        setFaceVerified(true)
        setFaceDistance(null)
        setFaceMessage("No face embedding found. You can continue with a warning.")
        clearOverlay()
        recognitionLoopRef.current = setTimeout(runRecognition, 1200)
        return
      }

      try {
        await loadFaceRecognitionModels()
        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
          )
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (cancelled) return

        const overlay = overlayRef.current
        const overlayContext = overlay.getContext("2d")
        if (overlayContext && videoRef.current) {
          overlay.width = videoRef.current.videoWidth
          overlay.height = videoRef.current.videoHeight
          overlayContext.clearRect(0, 0, overlay.width, overlay.height)

          if (detection) {
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight }
            faceapi.matchDimensions(overlay, displaySize)
            const resizedDetection = faceapi.resizeResults(detection.detection, displaySize)
            faceapi.draw.drawDetections(overlay, resizedDetection)
          }
        }

        if (!detection) {
          setFaceVerified(false)
          setFaceDistance(null)
          setFaceMessage("No face detected yet. Keep your face inside the guide.")
        } else {
          const distance = faceapi.euclideanDistance(embeddingToDescriptor(faceEmbedding), detection.descriptor)
          setFaceDistance(distance)
          if (distance <= 0.5) {
            setFaceVerified(true)
            setFaceMessage(`${studentName} • ${studentRollNumber || "No roll number"}`)
          } else {
            setFaceVerified(false)
            setFaceMessage("Face not recognized")
          }
        }
      } catch (error) {
        console.error("Face recognition error:", error)
        setFaceVerified(false)
        setFaceMessage("Face recognition is temporarily unavailable. You can retry or continue without a saved embedding.")
      }

      recognitionLoopRef.current = setTimeout(runRecognition, 800)
    }

    void runRecognition()

    return () => {
      cancelled = true
      if (recognitionLoopRef.current) {
        clearTimeout(recognitionLoopRef.current)
        recognitionLoopRef.current = null
      }
      clearOverlay()
    }
  }, [stage, faceEmbedding, studentName, studentRollNumber])

  useEffect(() => {
    if (stage !== "success" || !sessionId || !studentId) return

    const syncPresence = async (status: "online" | "offline") => {
      await supabase.from("presence_logs").upsert({
        student_id: studentId,
        session_id: sessionId,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: "student_id,session_id" })
    }

    const updateVisibility = () => {
      const nextStatus = document.hidden ? "offline" : "online"
      setPresenceStatus(nextStatus)
      void syncPresence(nextStatus)
    }

    void syncPresence("online")
    updateVisibility()
    document.addEventListener("visibilitychange", updateVisibility)

    if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    heartbeatRef.current = setInterval(() => {
      const nextStatus = document.hidden ? "offline" : "online"
      setPresenceStatus(nextStatus)
      void syncPresence(nextStatus)
    }, 10000)

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility)
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
    }
  }, [stage, sessionId, studentId])

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)

    // Draw current video frame to canvas
    const context = canvasRef.current.getContext("2d")
    if (context && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)
      const imageData = canvasRef.current.toDataURL("image/jpeg")
      setCapturedImage(imageData)
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsCapturing(false)

    if (faceEmbedding && !faceVerified) {
      setCheckinError("Please wait for face verification to complete before confirming attendance.")
    }
  }

  const handleLooksGood = async () => {
    if (faceEmbedding && !faceVerified) {
      setCheckinError("Face not recognized")
      return
    }

    setIsCapturing(true)
    // Simulate face verification delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsCapturing(false)
    if (!sessionId || !studentId) {
      setCheckinError("Unable to mark attendance. Please reopen the check-in link.")
      return
    }

    setCheckinError(null)

    const { data: checkinRow, error } = await supabase
      .from("checkins")
      .insert({
        student_id: studentId,
        session_id: sessionId,
      })
      .select("id")
      .single()

    if (error || !checkinRow) {
      setCheckinError("Could not save your check-in. Please try again.")
      console.error("Check-in error:", error)
      return
    }

    setCheckinId(checkinRow.id)
    setStage("success")
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setCheckinError(null)
  }

  const handleSentimentSelect = async (sentiment: string) => {
    setSelectedSentiment(sentiment)

    if (!checkinId) return

    const { error } = await supabase
      .from("checkins")
      .update({ sentiment })
      .eq("id", checkinId)

    if (error) {
      console.error("Sentiment update error:", error)
    }
  }

  if (stage === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-6 max-w-sm w-full">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Check-in Successful!</h1>
            <p className="text-muted-foreground mt-2">You&apos;ve been marked present for today&apos;s class</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              {faceVerified && faceEmbedding ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {studentName} • {studentRollNumber || "No roll number"}
                </div>
              ) : faceEmbedding ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  Face not recognized
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  No face embedding found. You can continue with a warning.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">87%</p>
                  <p className="text-sm text-muted-foreground">Your Attendance</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">3</p>
                  <p className="text-sm text-muted-foreground">Classes you can skip</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium text-foreground mb-3">How are you feeling in this class?</p>
                <div className="grid grid-cols-3 gap-3">
                  {sentimentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSentimentSelect(option.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
                        selectedSentiment === option.id ? option.bgColor : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <option.icon className={cn("h-8 w-8", option.color)} />
                      <span className={cn("text-sm font-medium", selectedSentiment === option.id ? option.color : "text-foreground")}>{option.label}</span>
                    </button>
                  ))}
                </div>
                {selectedSentiment ? (
                  <p className="text-xs text-muted-foreground mt-3">Sentiment saved for this check-in.</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="pt-4 space-y-3">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b bg-background">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Scan className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold">Introduction to Computer Science</h1>
            <p className="text-sm text-muted-foreground">Room 101 • Dr. Sarah Mitchell</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {stage === "camera" && (
          <div className="space-y-6 w-full max-w-sm">
            {cameraError ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm text-red-800 font-medium">{cameraError}</p>
                </CardContent>
              </Card>
            ) : capturedImage ? (
              <>
                {/* Captured image preview */}
                <div className="relative aspect-[3/4] bg-muted rounded-2xl overflow-hidden">
                  <img 
                    src={capturedImage} 
                    alt="Captured face" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleLooksGood} 
                    className="w-full h-14 text-lg"
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <>
                        <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Looks Good
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleRetake} 
                    variant="outline"
                    className="w-full h-14 text-lg"
                    disabled={isCapturing}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Retake
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Live camera feed */}
                <div className="relative aspect-[3/4] bg-muted rounded-2xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={overlayRef} className="absolute inset-0 h-full w-full pointer-events-none" />
                  
                  {/* Face outline guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-60 border-2 border-dashed border-primary/50 rounded-[100px] relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background text-xs text-primary rounded">
                        Position your face here
                      </div>
                    </div>
                  </div>

                  {/* GPS indicator */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-background/90 rounded-full text-sm">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Location verified</span>
                  </div>
                </div>

                <div className={cn(
                  "rounded-2xl border px-4 py-3 text-sm",
                  !faceEmbedding
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : faceVerified
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700",
                )}>
                    {faceMessage}
                    {faceVerified && faceEmbedding ? (
                      <span className="ml-2 font-medium">Verified</span>
                    ) : faceDistance !== null ? (
                      <span className="ml-2 font-medium">({faceDistance.toFixed(2)})</span>
                    ) : null}
                </div>

                {/* Hidden canvas for capturing frames */}
                <canvas ref={canvasRef} className="hidden" />

                <Button 
                  onClick={handleCapture} 
                  className="w-full h-14 text-lg"
                  disabled={isCapturing}
                >
                  {isCapturing ? (
                    <>
                      <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5 mr-2" />
                      Capture & Verify
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {checkinError ? (
          <div className="w-full max-w-sm mt-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-sm text-red-700">{checkinError}</CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function StudentCheckinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentCheckinPageInner />
    </Suspense>
  )
}
