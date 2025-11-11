import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

const AdminTasks = () => {
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/admin/tasks')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data.error) setError(data.error);
        else setTasks(data.tasks || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">Manage all tasks</p>
        </div>
        <Button onClick={async () => {
          const title = window.prompt('Task title');
          if (!title) return;
          const desc = window.prompt('Description (optional)') || '';
          try {
            const res = await fetch('/api/admin/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description: desc }) });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setTasks((t) => [data.task, ...t]);
          } catch (e: any) {
            console.error('Create task failed', e);
            alert(e?.message || 'Create failed');
          }
        }}><Plus className="w-4 h-4 mr-2" />Create Task</Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Click to edit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading && <div className="p-4">Loading...</div>}
            {error && <div className="p-4 text-red-600">{error}</div>}
            {!loading && !error && tasks.length === 0 && <div className="p-4 text-muted-foreground">No tasks found</div>}
            {!loading && !error && tasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/50">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.client_id || '—'} • {task.assignee || '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>{task.priority}</Badge>
                  <Badge>{task.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTasks;
