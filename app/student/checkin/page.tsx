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
import { loadFaceRecognitionModels } from "@/lib/face-api"

const sentimentOptions = [
  { id: "focused", label: "Focused", icon: Smile, color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
  { id: "neutral", label: "Neutral", icon: Meh, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  { id: "lost", label: "Lost", icon: Frown, color: "text-red-500", bgColor: "bg-red-50 border-red-200" },
]

function StudentCheckinPageInner() {
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<"camera" | "success">("camera")
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [checkinError, setCheckinError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionTitle, setSessionTitle] = useState("Introduction to Computer Science")
  const [sessionSubTitle, setSessionSubTitle] = useState("Room 101 • Dr. Sarah Mitchell")
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string>("Student")
  const [studentRollNumber, setStudentRollNumber] = useState<string>("")
  const [checkinId, setCheckinId] = useState<string | null>(null)
  const [presenceStatus, setPresenceStatus] = useState<"online" | "offline">("online")
  const [modelsLoading, setModelsLoading] = useState(true)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [bestMatch, setBestMatch] = useState<{
    name: string
    roll: string
    distance: number
    matchPercent: number
  } | null>(null)
  const [isMarking, setIsMarking] = useState(false)
  const [faceVerified, setFaceVerified] = useState(false)
  const [faceMessage, setFaceMessage] = useState("Position your face in the frame to verify attendance.")
  const [faceDistance, setFaceDistance] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRunningRef = useRef(false)

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

  // Load face-api.js models exactly once before any detection happens.
  useEffect(() => {
    let mounted = true

    const bootModels = async () => {
      setModelsLoading(true)
      setModelsError(null)
      setFaceVerified(false)
      setBestMatch(null)
      setFaceDistance(null)
      setFaceMessage("Loading face models...")

      try {
        await loadFaceRecognitionModels()
        if (!mounted) return
        setModelsLoading(false)
        setFaceMessage("Position your face in the frame to verify attendance.")
      } catch (error) {
        console.error("Face model loading error:", error)
        if (!mounted) return
        setModelsLoading(false)
        setModelsError("Failed to load face models.")
        setFaceMessage("Face models failed to load.")
      }
    }

    void bootModels()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (stage !== "camera") return
    if (modelsLoading) return
    if (modelsError) return

    let cancelled = false

    const clearOverlay = () => {
      if (!overlayRef.current) return
      const context = overlayRef.current.getContext("2d")
      context?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
    }

    const loadEnrolledFaces = (): Array<{ name: string; roll: string; descriptor: Float32Array }> => {
      try {
        const faces: Array<{ name: string; roll: string; descriptor: Float32Array }> = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (!key) continue
          const raw = localStorage.getItem(key)
          if (!raw) continue

          let parsed: any = null
          try {
            parsed = JSON.parse(raw)
          } catch {
            continue
          }

          const faceDescriptor = parsed?.faceDescriptor
          if (
            parsed &&
            typeof parsed.name === "string" &&
            typeof parsed.roll === "string" &&
            Array.isArray(faceDescriptor) &&
            faceDescriptor.length === 128 &&
            faceDescriptor.every((n: unknown) => typeof n === "number")
          ) {
            faces.push({
              name: parsed.name,
              roll: parsed.roll,
              descriptor: new Float32Array(faceDescriptor),
            })
          }
        }
        return faces
      } catch {
        return []
      }
    }

    const drawLabel = (params: {
      context: CanvasRenderingContext2D
      box: { x: number; y: number; width: number; height: number }
      text: string
      tone: "match" | "unknown"
    }) => {
      const { context, box, text, tone } = params
      const green = "rgba(16, 185, 129, 1)"
      const red = "rgba(239, 68, 68, 1)"
      const toneColor = tone === "match" ? green : red

      context.strokeStyle = toneColor
      context.lineWidth = 2
      context.strokeRect(box.x, box.y, box.width, box.height)

      context.font = "14px Arial"
      const padding = 4
      const textMetrics = context.measureText(text)
      const labelWidth = textMetrics.width + padding * 2
      const labelHeight = 18

      const labelX = Math.max(0, box.x)
      const insideY = box.y + Math.min(16, box.height - 4)
      const labelY = insideY > box.y ? insideY : box.y + box.height + 2

      context.fillStyle = "rgba(0,0,0,0.45)"
      context.fillRect(labelX, labelY - labelHeight + 2, labelWidth, labelHeight)

      context.fillStyle = toneColor
      context.fillText(text, labelX + padding, labelY + 4)
    }

    recognitionIntervalRef.current = setInterval(() => {
      void (async () => {
        if (cancelled) return
        if (recognitionRunningRef.current) return
        if (!videoRef.current || !overlayRef.current || videoRef.current.readyState < 2) return

        recognitionRunningRef.current = true
        try {
          const enrolledFaces = loadEnrolledFaces()

          const detections = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }),
            )
            .withFaceLandmarks()
            .withFaceDescriptors()

          if (cancelled) return

          const overlay = overlayRef.current
          const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight }
          overlay.width = displaySize.width
          overlay.height = displaySize.height

          const context = overlay.getContext("2d")
          if (!context) return
          context.clearRect(0, 0, overlay.width, overlay.height)

          if (!detections || detections.length === 0) {
            setBestMatch(null)
            setFaceVerified(false)
            setFaceDistance(null)
            setFaceMessage("No face detected yet. Keep your face inside the guide.")
            return
          }

          const resizedDetections = faceapi.resizeResults(detections, displaySize) as any[]

          let nextBest: { name: string; roll: string; distance: number; matchPercent: number } | null = null

          for (const det of resizedDetections) {
            const box = det.detection.box
            const descriptor = det.descriptor as Float32Array

            let labelText = "Unknown"
            let tone: "match" | "unknown" = "unknown"

            if (enrolledFaces.length > 0) {
              let closest: { distance: number; face: (typeof enrolledFaces)[number] } | null = null
              for (const enrolled of enrolledFaces) {
                const distance = faceapi.euclideanDistance(descriptor, enrolled.descriptor)
                if (!closest || distance < closest.distance) {
                  closest = { distance, face: enrolled }
                }
              }

              if (closest && closest.distance < 0.5) {
                const matchPercent = Math.round((1 - closest.distance) * 100)
                labelText = `${closest.face.name} — ${closest.face.roll} — ${matchPercent}% match`
                tone = "match"

                if (!nextBest || closest.distance < nextBest.distance) {
                  nextBest = {
                    name: closest.face.name,
                    roll: closest.face.roll,
                    distance: closest.distance,
                    matchPercent,
                  }
                }
              }
            }

            drawLabel({
              context,
              box,
              text: labelText,
              tone,
            })
          }

          setBestMatch(nextBest)
          setFaceVerified(Boolean(nextBest))
          setFaceDistance(nextBest?.distance ?? null)
          if (nextBest) {
            setFaceMessage(`${nextBest.name} — ${nextBest.roll} — ${nextBest.matchPercent}% match`)
          } else {
            setFaceMessage("Face not recognized")
          }
        } catch (error) {
          console.error("Face recognition error:", error)
          setBestMatch(null)
          setFaceVerified(false)
          setFaceDistance(null)
          setFaceMessage("Face recognition is temporarily unavailable. Please try again.")
        } finally {
          recognitionRunningRef.current = false
        }
      })()
    }, 500)

    return () => {
      cancelled = true
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current)
        recognitionIntervalRef.current = null
      }
      clearOverlay()
    }
  }, [stage, modelsLoading, modelsError])

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

  const resolveUserIdByRoll = async (roll: string) => {
    try {
      const { data, error } = await supabase.from("users").select("id").eq("roll_number", roll).single()
      if (!error && data?.id) return data.id
    } catch (error) {
      console.error("roll_number lookup error:", error)
    }

    try {
      const { data, error } = await supabase.from("users").select("id").eq("rollNumber", roll).single()
      if (!error && data?.id) return data.id
    } catch (error) {
      console.error("rollNumber lookup error:", error)
    }

    return null
  }

  const handleMarkAttendance = async () => {
    if (!bestMatch || bestMatch.matchPercent <= 50) {
      setCheckinError("Face not recognized")
      return
    }

    if (!sessionId) {
      setCheckinError("Unable to mark attendance. Please reopen the check-in link.")
      return
    }

    setIsMarking(true)
    setCheckinError(null)

    try {
      const matchedStudentId = await resolveUserIdByRoll(bestMatch.roll)
      if (!matchedStudentId) {
        setCheckinError("Unable to find student for the matched roll number.")
        return
      }

      // Ensure the presence and check-in record reference the matched face.
      setStudentId(matchedStudentId)
      setStudentName(bestMatch.name)
      setStudentRollNumber(bestMatch.roll)
      setFaceVerified(true)
      setFaceDistance(bestMatch.distance)

      const { data: checkinRow, error } = await supabase
        .from("checkins")
        .insert({
          student_id: matchedStudentId,
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
    } catch (error) {
      console.error("Attendance mark error:", error)
      setCheckinError("Could not save your check-in. Please try again.")
    } finally {
      setIsMarking(false)
    }
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
              {faceVerified ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {studentName} • {studentRollNumber || "No roll number"}
                </div>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  Face not recognized
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

                <div
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm",
                    modelsLoading
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : bestMatch && bestMatch.matchPercent > 50
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700",
                  )}
                >
                  {modelsLoading ? "Loading face models..." : faceMessage}
                </div>

                <Button
                  onClick={handleMarkAttendance}
                  className="w-full h-14 text-lg"
                  disabled={!bestMatch || bestMatch.matchPercent <= 50 || isMarking || modelsLoading || Boolean(cameraError)}
                >
                  {isMarking ? (
                    <>
                      <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark Attendance
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
