"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">System Settings</h1>
        <p className="text-muted-foreground text-sm">Configure organization-wide settings</p>
      </div>

      {/* Attendance Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Rules</CardTitle>
          <CardDescription>Configure attendance thresholds and policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="threshold">At-Risk Threshold (%)</Label>
              <Input id="threshold" type="number" defaultValue="75" min="0" max="100" />
              <p className="text-xs text-muted-foreground">Students below this are flagged</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grace">Late Check-in Grace Period</Label>
              <Select defaultValue="15">
                <SelectTrigger id="grace">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Notifications</Label>
              <p className="text-sm text-muted-foreground">Notify students when attendance drops</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Parent/Guardian Alerts</Label>
              <p className="text-sm text-muted-foreground">Send alerts to guardians for at-risk students</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Verification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Settings</CardTitle>
          <CardDescription>Configure check-in verification methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Face Verification</Label>
              <p className="text-sm text-muted-foreground">Mandatory for all sessions</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require GPS Verification</Label>
              <p className="text-sm text-muted-foreground">Verify student location</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="similarity">Face Match Threshold (%)</Label>
            <Input id="similarity" type="number" defaultValue="80" min="50" max="100" />
            <p className="text-xs text-muted-foreground">Minimum similarity for auto-approval</p>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage data retention and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention">Data Retention Period</Label>
            <Select defaultValue="365">
              <SelectTrigger id="retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
                <SelectItem value="forever">Indefinitely</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Anonymize Check-in Photos</Label>
              <p className="text-sm text-muted-foreground">Auto-delete photos after verification</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save All Changes</Button>
      </div>
    </div>
  )
}
