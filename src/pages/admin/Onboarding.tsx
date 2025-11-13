import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, FileCheck, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";

const AdminOnboarding = () => {
  const { toast } = useToast();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [queue, setQueue] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    apiFetch('/api/admin/onboarding')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data.error) setError(data.error);
        else setQueue(data.applicants || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
    apiFetch('/api/admin/onboarding')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setQueue(data.applicants || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await apiFetch(`/api/admin/onboarding/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast({ title: 'Application approved', description: `${name} has been approved and added to the system` });
      refresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Approve failed', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!selectedApplicant) return;
    if (!rejectionReason.trim()) {
      toast({ title: 'Provide reason', description: 'Please add a rejection reason', variant: 'destructive' });
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/onboarding/${selectedApplicant.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast({ title: 'Application rejected', description: `${selectedApplicant.name} has been notified`, variant: 'destructive' });
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedApplicant(null);
      refresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Reject failed', variant: 'destructive' });
    }
  };

  const openRejectDialog = (app: { id: string; name: string }) => {
    setSelectedApplicant(app);
    setShowRejectDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Onboarding Queue</h1>
        <p className="text-muted-foreground">Review and approve new employee applications</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queue.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">New employees</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">With feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
          <CardDescription>New applications awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && <div className="p-4">Loading...</div>}
            {error && <div className="p-4 text-red-600">{error}</div>}
            {!loading && !error && queue.length === 0 && <div className="p-4 text-muted-foreground">No pending applicants</div>}
            {!loading && !error && queue.map((applicant) => (
              <div key={applicant.id} className="p-4 border rounded-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-lg mb-1">{applicant.full_name || applicant.name}</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{applicant.email || applicant.phone}</p>
                        <p>{applicant.phone}</p>
                        <p>Submitted: {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <FileCheck className="w-3 h-3 mr-1" />
                      {/* documents count unknown in API; show dash */}—
                    </Badge>
                    <Badge>{applicant.status}</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Documents:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Aadhaar Card (verified)</li>
                      <li>Passport (verified)</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRejectDialog({ id: applicant.id, name: applicant.full_name || applicant.name })}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(applicant.id, applicant.full_name || applicant.name)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedApplicant?.name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this application is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOnboarding;
