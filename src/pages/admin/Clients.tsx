import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

const AdminClients = () => {
  const [clients, setClients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    apiFetch('/api/admin/clients')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data.error) setError(data.error);
        else setClients(data.clients || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  const handleAdd = async () => {
    const name = window.prompt('Client name');
    if (!name) return;
    const email = window.prompt('Contact email (optional)') || '';
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, contact_email: email }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setClients((c) => [data.client, ...c]);
    } catch (e: any) {
      setError(e?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clients</h1>
          <p className="text-muted-foreground">Manage clients</p>
        </div>
        <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Client</Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading && <div className="p-4">Loading...</div>}
            {error && <div className="p-4 text-red-600">{error}</div>}
            {!loading && !error && clients.length === 0 && <div className="p-4 text-muted-foreground">No clients found</div>}
            {!loading && !error && clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.contact_email || client.contact_phone}</p>
                </div>
                <p className="text-sm">—</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClients;
