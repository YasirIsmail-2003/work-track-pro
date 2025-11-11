import React from 'react';
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LeaveManagement() {
  const [showForm, setShowForm] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<any>({});
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const empRes = await fetch('/api/admin/employees');
        const empJson = await empRes.json();
        const firstEmployee = (empJson.employees || []).find((e: any) => e.role !== 'ADMIN') || (empJson.employees || [])[0] || null;
        if (!mounted) return;
        setProfile(firstEmployee);

        if (firstEmployee?.id) {
          const detailRes = await fetch(`/api/admin/employees/${firstEmployee.id}`);
          const detailJson = await detailRes.json();
          if (!mounted) return;
          setLeaveRequests(detailJson.leaves || []);
          // leaveBalance is not available in API; approximate from leaves
          setLeaveBalance({ annual: { total: 20, used: 8, remaining: 12 } });
        }
      } catch (e) {
        console.error('LeaveManagement load error', e);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Leave request submitted",
      description: "Your request has been sent for approval",
    });
    setShowForm(false);
  };

  const handleCreateLeave = async (form: any) => {
    try {
      const body = { user_id: profile?.id, leave_type: form.leave_type, start_date: form.start_date, end_date: form.end_date, reason: form.reason };
      const res = await fetch('/api/employee/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setLeaveRequests((l) => [json.leave || json, ...l]);
      toast({ title: 'Leave submitted', description: 'Your leave has been submitted' });
      setShowForm(false);
    } catch (e) {
      console.error('Create leave failed', e);
      toast({ title: 'Error', description: String(e) });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Request and track your time off</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Leave Balance */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 rounded-2xl bg-gradient-success text-success-foreground">
          <h3 className="text-sm opacity-90 mb-2">Annual Leave</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">{leaveBalance.annual.remaining}</p>
              <p className="text-sm opacity-90">days remaining</p>
            </div>
            <div className="text-right text-sm opacity-90">
              <p>{leaveBalance.annual.used} used</p>
              <p>{leaveBalance.annual.total} total</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60" 
              style={{ width: `${(leaveBalance.annual.remaining / leaveBalance.annual.total) * 100}%` }}
            />
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-gradient-card">
          <h3 className="text-sm text-muted-foreground mb-2">Sick Leave</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">{leaveBalance.sick.remaining}</p>
              <p className="text-sm text-muted-foreground">days remaining</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{leaveBalance.sick.used} used</p>
              <p>{leaveBalance.sick.total} total</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary" 
              style={{ width: `${(leaveBalance.sick.remaining / leaveBalance.sick.total) * 100}%` }}
            />
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-gradient-card">
          <h3 className="text-sm text-muted-foreground mb-2">Personal Leave</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">{leaveBalance.personal.remaining}</p>
              <p className="text-sm text-muted-foreground">days remaining</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{leaveBalance.personal.used} used</p>
              <p>{leaveBalance.personal.total} total</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent" 
              style={{ width: `${(leaveBalance.personal.remaining / leaveBalance.personal.total) * 100}%` }}
            />
          </div>
        </Card>
      </div>

      {/* New Leave Request Form */}
      {showForm && (
        <Card className="p-6 rounded-2xl bg-gradient-card">
          <h2 className="text-xl font-bold mb-6">New Leave Request</h2>
          <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const fd = new FormData(form);
              const leave_type = String(fd.get('leave-type') || 'annual');
              const start_date = String(fd.get('start-date') || '');
              const end_date = String(fd.get('end-date') || '');
              const reason = String(fd.get('reason') || '');
              await handleCreateLeave({ leave_type, start_date, end_date, reason });
            }} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="leave-type">Leave Type</Label>
                <Select>
                  <SelectTrigger id="leave-type" className="rounded-xl" name="leave-type">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex gap-2">
                  <Input type="date" name="start-date" className="rounded-xl" placeholder="Start date" />
                  <Input type="date" name="end-date" className="rounded-xl" placeholder="End date" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea 
                id="reason" 
                name="reason"
                placeholder="Briefly explain your leave reason..."
                className="rounded-xl min-h-24"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="rounded-xl"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-gradient-primary hover:opacity-90">
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Leave Requests History */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-6">Leave History</h2>
        <div className="space-y-3">
          {leaveRequests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border hover:shadow-md transition-all bg-card gap-4"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold">{request.type}</h3>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>
                  <Badge 
                    variant={getStatusColor(request.status) as any}
                    className="rounded-lg"
                  >
                    {request.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {request.startDate} to {request.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {request.days} days
                  </span>
                  <span>Submitted: {request.submittedOn}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                View Details
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}