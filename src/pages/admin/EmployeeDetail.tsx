import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Phone, Calendar, DollarSign, Clock, FileText, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payRate, setPayRate] = useState("50");
  const [maxHours, setMaxHours] = useState("40");
  const [profile, setProfile] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    apiFetch(`/api/admin/employees/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data.error) setError(data.error);
        else {
          setProfile(data.profile || null);
          setDocuments(data.documents || []);
          setTimesheets(data.timesheets || []);
          setLeaves(data.leaves || []);
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, [id]);
  const [mockAudit, setMockAudit] = useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    async function loadAudit() {
      if (!id) return;
      try {
        const res = await apiFetch(`/api/admin/audit?user_id=${id}&limit=200`);
        const json = await res.json();
        if (!mounted) return;
        const rows = (json.events || []).map((r:any) => ({ action: r.type === 'time_entry' ? (r.payload.is_break ? 'Break' : (r.payload.task_id ? `Work on ${r.payload.task_id}` : 'Work block')) : r.type, date: r.timestamp || r.payload?.created_at, by: profile?.full_name || id }));
        setMockAudit(rows);
      } catch (e) {
        console.error('load audit', e);
      }
    }
    loadAudit();
    return () => { mounted = false };
  }, [id, profile]);

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Employee settings have been updated",
    });
  };

  const handleDeactivate = () => {
    toast({
      title: "Employee deactivated",
      description: `${profile?.full_name || ''} has been deactivated`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/admin/employees")}> 
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{profile?.full_name || ''}</h1>
          <p className="text-muted-foreground">{profile?.employee_id || ''}</p>
        </div>
          <Badge variant={(profile?.status || '').toLowerCase() === 'active' ? "default" : "outline"}>
          {profile?.status || ''}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="rounded-2xl lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Employee ID</p>
                  <p className="text-sm text-muted-foreground">{profile?.employee_id}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile?.email || profile?.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{profile?.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Join Date</p>
                  <p className="text-sm text-muted-foreground">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{profile?.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settings */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage employee configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payRate">Pay Rate (₹/hr)</Label>
                  <Input
                    id="payRate"
                    type="number"
                    value={payRate}
                    onChange={(e) => setPayRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxHours">Max Hours/Week</Label>
                  <Input
                    id="maxHours"
                    type="number"
                    value={maxHours}
                    onChange={(e) => setMaxHours(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
                <Button variant="destructive" onClick={handleDeactivate}>
                  Deactivate Employee
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
              <TabsTrigger value="leaves">Leaves</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Documents
                  </CardTitle>
                  <CardDescription>Verified documents with masked sensitive data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{doc.type || doc.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.url || doc.masked || ''}</p>
                        </div>
                        <Badge>{doc.status || '—'}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timesheets">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timesheets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {timesheets.map((timesheet, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{timesheet.week_start ? `${new Date(timesheet.week_start).toLocaleDateString()} - ${new Date(timesheet.week_end).toLocaleDateString()}` : timesheet.week}</p>
                          <p className="text-sm text-muted-foreground">
                            {timesheet.total_hours || timesheet.hours || 0}h
                          </p>
                        </div>
                        <Badge variant={(timesheet.status || '').toLowerCase() === 'approved' ? "default" : "secondary"}>
                          {timesheet.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaves">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Leave Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaves.map((leave, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{leave.leave_type || leave.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {leave.start_date ? `${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}` : leave.dates} ({leave.days || ''} days)
                          </p>
                        </div>
                        <Badge variant={(leave.status || '').toLowerCase() === 'approved' ? "default" : "secondary"}>
                          {leave.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Audit Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAudit.map((entry, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <p className="font-medium mb-1">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.date} • By {entry.by}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
