import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminTimesheets = () => {
  const [timesheets, setTimesheets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetch('/api/admin/timesheets')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data.error) setError(data.error);
        else setTimesheets(data.timesheets || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
    fetch('/api/admin/timesheets')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTimesheets(data.timesheets || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/timesheets/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      refresh();
    } catch (e: any) {
      setError(e?.message || 'Approve failed');
    }
  };

  const returnSheet = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/timesheets/${id}/return`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Please correct hours' }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      refresh();
    } catch (e: any) {
      setError(e?.message || 'Return failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Timesheets</h1>
        <p className="text-muted-foreground">Approve timesheets</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading && <div className="p-4">Loading...</div>}
            {error && <div className="p-4 text-red-600">{error}</div>}
            {!loading && !error && timesheets.length === 0 && <div className="p-4 text-muted-foreground">No timesheets found</div>}
            {!loading && !error && timesheets.map((ts) => (
              <div key={ts.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-medium">{ts.user_id}</p>
                  <p className="text-sm text-muted-foreground">{ts.week_start} - {ts.week_end} • {ts.total_hours}h</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => returnSheet(ts.id)}>Return</Button>
                  <Button size="sm" onClick={() => approve(ts.id)}>Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTimesheets;
