"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, CheckCircle2, Save, ScanFace, Users } from "lucide-react"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { getUser } from "@/lib/auth"
import { descriptorToEmbedding, loadFaceRecognitionModels, parseFaceEmbedding } from "@/lib/face-api"

interface StudentRow {
  id: string
  name?: string | null
  email?: string | null
  role?: string | null
  org_type?: string | null
  face_embedding?: number[] | string | null
}

export default function FaceEnrollmentPage() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [status, setStatus] = useState("Select a student to begin enrollment.")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedDescriptor, setCapturedDescriptor] = useState<number[] | null>(null)
  const [adminLabel, setAdminLabel] = useState("Admin")

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        const currentUser = await getUser()
        if (currentUser && mounted) {
          setAdminLabel(currentUser.name || currentUser.email || "Admin")
        }

        const query = supabase
          .from("users")
          .select("id, name, email, role, org_type, face_embedding")
          .eq("role", "student")
          .order("name", { ascending: true })

        const { data, error } = await query

        if (error) {
          throw error
        }

        if (mounted) {
          setStudents((data as StudentRow[]) || [])
          setSelectedStudentId((data?.[0] as StudentRow | undefined)?.id || "")
          setStatus(data?.length ? "Camera ready. Capture a face to save the embedding." : "No students were found in the database.")
        }
      } catch (error) {
        console.error("Student load error:", error)
        if (mounted) {
          setStatus("Unable to load students right now.")
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    const startCamera = async () => {
      try {
        setCameraError(null)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          await videoRef.current.play()
        }
      } catch (error) {
        console.error("Camera error:", error)
        setCameraError("Camera access denied. Please allow access to enroll student faces.")
      }
    }

    void loadFaceRecognitionModels().then(() => {
      if (mounted) {
        void loadData()
        void startCamera()
      }
    })

    return () => {
      mounted = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!selectedStudent) {
      setCapturedImage(null)
      setCapturedDescriptor(null)
      return
    }

    const existingEmbedding = parseFaceEmbedding(selectedStudent.face_embedding)
    if (existingEmbedding) {
      setStatus(`Existing face data found for ${selectedStudent.name || "this student"}. Capturing a new sample will replace it.`)
    } else {
      setStatus(`Ready to enroll ${selectedStudent.name || "this student"}.`)
    }
  }, [selectedStudent])

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !overlayRef.current) {
      return
    }

    setIsSaving(false)
    setCapturedDescriptor(null)
    setStatus("Detecting face...")

    try {
      await loadFaceRecognitionModels()
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor()

      const context = canvasRef.current.getContext("2d")
      if (context && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        setCapturedImage(canvasRef.current.toDataURL("image/jpeg"))
      }

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
        setStatus("No face detected. Keep your face centered in the frame.")
        return
      }

      setCapturedDescriptor(descriptorToEmbedding(detection.descriptor))
      setStatus("Face captured. Review the preview and save the enrollment.")
    } catch (error) {
      console.error("Face capture error:", error)
      setStatus("Face capture failed. Please try again with better lighting.")
    }
  }

  const handleSave = async () => {
    if (!selectedStudentId || !capturedDescriptor) {
      setStatus("Capture a valid face before saving.")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({ face_embedding: capturedDescriptor })
        .eq("id", selectedStudentId)

      if (error) {
        throw error
      }

      setStudents((current) =>
        current.map((student) =>
          student.id === selectedStudentId
            ? { ...student, face_embedding: capturedDescriptor }
            : student
        )
      )
      setStatus("Face enrollment saved successfully.")
    } catch (error) {
      console.error("Face enrollment save error:", error)
      setStatus("Unable to save the face embedding right now.")
    } finally {
      setIsSaving(false)
    }
  }

  const selectedFaceCount = capturedDescriptor?.length || parseFaceEmbedding(selectedStudent?.face_embedding)?.length || 0

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
              <CardDescription>Keep the student centered in the frame, then capture the face.</CardDescription>
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
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-72 w-56 rounded-[2rem] border-2 border-dashed border-white/60" />
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={captureFace} disabled={Boolean(cameraError) || isLoading || !selectedStudentId}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Face
                </Button>
                <Button variant="outline" onClick={handleSave} disabled={!capturedDescriptor || isSaving || isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Enrollment"}
                </Button>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                {status}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Student</CardTitle>
                <CardDescription>Choose a student before capturing a new face profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-select">Student</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger id="student-select">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => {
                        const label = student.name || student.email || student.id
                        return (
                          <SelectItem key={student.id} value={student.id}>
                            {label}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStudent ? (
                  <div className="rounded-2xl border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{selectedStudent.name || selectedStudent.email || "Student"}</p>
                        <p className="text-sm text-muted-foreground">{selectedStudent.email || "No email available"}</p>
                      </div>
                      <Badge variant="outline">{selectedFaceCount > 0 ? `${selectedFaceCount} values` : "Not enrolled"}</Badge>
                    </div>
                  </div>
                ) : null}
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
