"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, CheckCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function JoinRoomPage() {
  const [stage, setStage] = useState<"code" | "photo" | "success">("code")
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleJoin = async () => {
    if (!roomCode) return
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsLoading(false)
    setStage("photo")
  }

  const handleUploadPhoto = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setStage("success")
  }

  if (stage === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Successfully Joined!</h1>
            <p className="text-muted-foreground mt-2">
              You have joined Introduction to Programming
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Room Details</p>
                <p className="font-medium">Introduction to Programming (CS101)</p>
                <p className="text-sm text-muted-foreground">Dr. Sarah Mitchell</p>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">ROOM-4X7K</code>
              </div>
            </CardContent>
          </Card>
          <Link href="/student">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/student" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {stage === "code" && (
          <Card>
            <CardHeader>
              <CardTitle>Join a Room</CardTitle>
              <CardDescription>
                Enter the Room ID provided by your teacher
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-code">Room ID</Label>
                <Input
                  id="room-code"
                  placeholder="e.g. ROOM-4X7K"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="font-mono text-center text-lg h-12"
                />
              </div>
              <Button 
                className="w-full h-12" 
                disabled={!roomCode || isLoading}
                onClick={handleJoin}
              >
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {stage === "photo" && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Profile Photo</CardTitle>
              <CardDescription>
                This photo will be used for face verification during check-ins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square max-w-64 mx-auto rounded-2xl bg-muted flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer">
                <Camera className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Click to take or upload photo</p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button variant="outline" className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full h-12"
                  onClick={handleUploadPhoto}
                  disabled={isLoading}
                >
                  {isLoading ? "Joining Room..." : "Complete Setup"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your photo is stored securely and only used for attendance verification
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
