"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, CheckCircle2, ScanFace, Users } from "lucide-react"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getUser } from "@/lib/auth"
import { loadFaceRecognitionModels } from "@/lib/face-api"

type ManualStudent = {
  name: string
  roll: string
}

export default function FaceEnrollmentPage() {
  const [adminLabel, setAdminLabel] = useState("Admin")

  const [modelsLoading, setModelsLoading] = useState(true)
  const [modelsError, setModelsError] = useState<string | null>(null)

  const [manualName, setManualName] = useState("")
  const [manualRoll, setManualRoll] = useState("")
  const [importJson, setImportJson] = useState('[{"name":"Muhammad","roll":"CS-101"}]')
  const [importError, setImportError] = useState<string | null>(null)

  const [students, setStudents] = useState<ManualStudent[]>([])
  const [selectedStudent, setSelectedStudent] = useState<ManualStudent | null>(null)

  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [status, setStatus] = useState("Loading face models...")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const startCamera = async () => {
    if (typeof window === "undefined") return
    setCameraError(null)
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      const videoEl = videoRef.current
      if (!videoEl) throw new Error("Video element not ready.")

      // Assign stream directly to the video element (required for immediate preview).
      videoEl.srcObject = stream
      streamRef.current = stream
      await videoEl.play()
      setCameraActive(true)
    } catch (error) {
      console.error("Camera error:", error)
      setCameraActive(false)
      setCameraError("Camera access denied. Please allow access to enroll student faces.")
    }
  }

  useEffect(() => {
    let mounted = true

    const boot = async () => {
      try {
        const currentUser = await getUser()
        if (mounted && currentUser) {
          setAdminLabel(currentUser.name || currentUser.email || "Admin")
        }
      } catch (error) {
        console.error("Admin label error:", error)
      }

      setModelsLoading(true)
      setModelsError(null)
      setStatus("Loading face models...")
      try {
        await loadFaceRecognitionModels()
        if (mounted) {
          setModelsLoading(false)
          setStatus(selectedStudent ? `Ready to enroll ${selectedStudent.name}.` : "Select a student from the list to begin enrollment.")
        }
      } catch (error) {
        console.error("Face model loading error:", error)
        if (mounted) {
          setModelsLoading(false)
          setModelsError("Failed to load face models. Please refresh and try again.")
          setStatus("Face models failed to load.")
        }
      }
    }

    void boot()

    return () => {
      mounted = false
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (modelsLoading) return
    if (!selectedStudent) {
      setCapturedImage(null)
      setSuccessMessage(null)
      setStatus(students.length ? "Select a student from the list to begin enrollment." : "Add a student below to begin enrollment.")
      return
    }
    setCapturedImage(null)
    setSuccessMessage(null)
    setStatus(`Ready to enroll ${selectedStudent.name}.`)
  }, [selectedStudent, modelsLoading, students.length])

  const handleAddStudent = () => {
    setImportError(null)
    const name = manualName.trim()
    const roll = manualRoll.trim()
    if (!name || !roll) {
      setImportError("Student name and roll number are required.")
      return
    }

    setStudents((current) => {
      const withoutDuplicate = current.filter((s) => s.roll !== roll)
      return [{ name, roll }, ...withoutDuplicate]
    })
    setManualName("")
    setManualRoll("")
  }

  const handleImportStudents = () => {
    setImportError(null)
    setSuccessMessage(null)
    try {
      const parsed = JSON.parse(importJson)
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array.")
      }

      const next: ManualStudent[] = parsed
        .map((item: any) => ({
          name: typeof item?.name === "string" ? item.name.trim() : "",
          roll: typeof item?.roll === "string" ? item.roll.trim() : "",
        }))
        .filter((s: ManualStudent) => s.name && s.roll)

      if (next.length === 0) {
        throw new Error("No valid students found in JSON.")
      }

      setStudents((current) => {
        const byRoll = new Map<string, ManualStudent>()
        for (const s of current) byRoll.set(s.roll, s)
        for (const s of next) byRoll.set(s.roll, s)
        return Array.from(byRoll.values())
      })
    } catch (error) {
      console.error("Import error:", error)
      setImportError("Please provide valid JSON in the format: [{\"name\":\"Muhammad\",\"roll\":\"CS-101\"}].")
    }
  }

  const handleSelectStudent = async (student: ManualStudent) => {
    setSelectedStudent(student)
    setSuccessMessage(null)
    setCapturedImage(null)
    setCameraError(null)

    // Open the camera when a student is selected.
    if (typeof window !== "undefined" && !cameraActive) void startCamera()
  }

  const captureAndEnroll = async () => {
    if (!selectedStudent) {
      setStatus("Select a student first.")
      return
    }
    if (!videoRef.current || !overlayRef.current) {
      setStatus("Camera is not ready yet.")
      return
    }
    if (modelsLoading) {
      setStatus("Loading face models...")
      return
    }
    if (cameraError) {
      setStatus("Camera access is denied.")
      return
    }

    setIsEnrolling(true)
    setSuccessMessage(null)
    setCapturedImage(null)
    setStatus("Detecting face...")

    try {
      await loadFaceRecognitionModels()
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor()

      // Snapshot current frame for preview.
      const snapshotCanvas = document.createElement("canvas")
      snapshotCanvas.width = videoRef.current.videoWidth || 640
      snapshotCanvas.height = videoRef.current.videoHeight || 480
      const snapshotCtx = snapshotCanvas.getContext("2d")
      if (snapshotCtx) {
        snapshotCtx.drawImage(videoRef.current, 0, 0, snapshotCanvas.width, snapshotCanvas.height)
        setCapturedImage(snapshotCanvas.toDataURL("image/jpeg"))
      }

      // Clear overlay (admin doesn't need live detection boxes here).
      const overlayContext = overlayRef.current.getContext("2d")
      if (overlayContext && videoRef.current) {
        overlayRef.current.width = videoRef.current.videoWidth
        overlayRef.current.height = videoRef.current.videoHeight
        overlayContext.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
      }

      if (!detection) {
        setStatus("No face detected. Keep your face centered in the frame.")
        return
      }

      const faceDescriptor = Array.from(detection.descriptor)
      localStorage.setItem(
        selectedStudent.roll,
        JSON.stringify({
          name: selectedStudent.name,
          roll: selectedStudent.roll,
          faceDescriptor,
        }),
      )

      setStatus("Enrollment saved.")
      setSuccessMessage(`Face enrolled for ${selectedStudent.name}`)
    } catch (error) {
      console.error("Face capture error:", error)
      setStatus("Face capture failed. Please try again with better lighting.")
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 rounded-3xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ScanFace className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-semibold text-foreground">Face Enrollment</h1>
              </div>
              <p className="text-sm text-muted-foreground">Capture and save student face descriptors for attendance verification.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{adminLabel}</Badge>
            <Badge variant="outline">{students.length} students</Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-2">
              <CardTitle>Camera Preview</CardTitle>
              <CardDescription>Keep the student centered, then capture & enroll.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cameraError ? (
                <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {cameraError}
                </div>
              ) : (
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-950">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                  <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 h-full w-full" />
                  {cameraActive ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-72 w-56 rounded-[2rem] border-2 border-dashed border-white/60" />
                    </div>
                  ) : (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center">
                      <p className="text-sm text-muted-foreground">Click a student below to open the camera.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={captureAndEnroll}
                  disabled={!selectedStudent || Boolean(cameraError) || modelsLoading || !cameraActive || isEnrolling}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isEnrolling ? "Enrolling..." : "Capture & Enroll"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null)
                    setCapturedImage(null)
                    setSuccessMessage(null)
                    setStatus(students.length ? "Select a student from the list to begin enrollment." : "Add a student below to begin enrollment.")
                  }}
                  disabled={isEnrolling}
                >
                  Cancel
                </Button>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground min-h-[48px]">
                {modelsLoading ? "Loading face models..." : status}
              </div>

              {modelsError ? (
                <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {modelsError}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="inline-block h-4 w-4 mr-2" />
                  {successMessage}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Students</CardTitle>
                <CardDescription>Manually add students or import them from JSON.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="manual-student-name">Student Name</Label>
                    <Input
                      id="manual-student-name"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="e.g., Muhammad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-student-roll">Roll Number</Label>
                    <Input
                      id="manual-student-roll"
                      value={manualRoll}
                      onChange={(e) => setManualRoll(e.target.value)}
                      placeholder="e.g., CS-101"
                    />
                  </div>
                  <Button type="button" onClick={handleAddStudent} disabled={!manualName.trim() || !manualRoll.trim()}>
                    Add Student
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="student-import-json">Import Students (JSON)</Label>
                  <Textarea
                    id="student-import-json"
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    rows={4}
                  />
                  <Button type="button" variant="outline" onClick={handleImportStudents}>
                    Import
                  </Button>
                  {importError ? (
                    <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {importError}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Manually added students</Label>
                    <Badge variant="outline">{students.length}</Badge>
                  </div>
                  {students.length ? (
                    <div className="space-y-2">
                      {students.map((student) => {
                        const active = selectedStudent?.roll === student.roll
                        return (
                          <Button
                            key={student.roll}
                            type="button"
                            variant={active ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => void handleSelectStudent(student)}
                            disabled={isEnrolling}
                          >
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="truncate">{student.name}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">{student.roll}</span>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No students added yet. Use the form above.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {capturedImage ? (
              <Card>
                <CardHeader>
                  <CardTitle>Captured Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-hidden rounded-3xl border">
                    <img src={capturedImage} alt="Captured face preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Face descriptor ready to save.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>Make sure the student’s face is visible and not heavily shadowed.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>Captured embeddings will replace any existing face profile for this student.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
