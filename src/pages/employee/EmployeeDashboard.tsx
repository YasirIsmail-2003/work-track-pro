import React from 'react';
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, DollarSign, AlertCircle, Play, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api-client";

export default function EmployeeDashboard() {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [timesheets, setTimesheets] = React.useState<any[]>([]);
  const [presence, setPresence] = React.useState<any[]>([]);
  const [timeEntries, setTimeEntries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // pick a representative employee (first non-admin) for dev/testing
        const empRes = await apiFetch('/api/admin/employees');
        const empJson = await empRes.json();
        const firstEmployee = (empJson.employees || []).find((e: any) => e.role !== 'ADMIN') || (empJson.employees || [])[0] || null;
        if (!mounted) return;
        setProfile(firstEmployee);

        // load tasks and timesheets and presence and recent time entries
        const [tasksRes, tsRes, presRes, teRes] = await Promise.all([
          apiFetch('/api/admin/tasks'),
          apiFetch('/api/admin/timesheets'),
          apiFetch('/api/presence/now'),
          apiFetch('/api/admin/time_entries?limit=10'),
        ]);

        const [tasksJson, tsJson, presJson, teJson] = await Promise.all([tasksRes.json(), tsRes.json(), presRes.json(), teRes.json()]);
        if (!mounted) return;
        // filter tasks and timesheets for the selected employee
        const uid = firstEmployee?.id;
        setTasks((tasksJson.tasks || []).filter((t: any) => t.assignee === uid));
        setTimesheets((tsJson.timesheets || []).filter((t: any) => t.user_id === uid));
        setPresence(presJson.data || []);
        setTimeEntries(teJson.time_entries || []);
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const currentUserName = profile?.full_name || 'Team Member';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {currentUserName}!</h1>
        <p className="text-muted-foreground">Here's your activity overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Tasks"
          value={String(tasks.length)}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Hours This Week"
          value={String(timesheets.reduce((s, t) => s + (Number(t.total_hours) || 0), 0)) + 'h'}
          icon={Clock}
        />
        <StatsCard
          title="Earnings (Week)"
          value={profile ? `₹${(Number(profile.pay_rate_per_hour || 0) * (timesheets.reduce((s, t) => s + (Number(t.total_hours) || 0), 0))).toFixed(0)}` : '—'}
          icon={DollarSign}
        />
        <StatsCard
          title="Active Task"
          value={(() => {
            const p = presence.find((p) => p.user_id === profile?.id);
            return p ? (p.status || '—') : '—';
          })()}
          icon={AlertCircle}
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/app/employee/time">
            <Button className="w-full rounded-xl bg-gradient-success hover:opacity-90" size="lg">
              <Clock className="w-5 h-5 mr-2" />
              Clock In
            </Button>
          </Link>
          <Link to="/app/employee/tasks">
            <Button className="w-full rounded-xl" variant="outline" size="lg">
              <Play className="w-5 h-5 mr-2" />
              Start Task
            </Button>
          </Link>
          <Link to="/app/employee/leave">
            <Button className="w-full rounded-xl" variant="outline" size="lg">
              <Calendar className="w-5 h-5 mr-2" />
              Request Leave
            </Button>
          </Link>
        </div>
      </Card>

      {/* Current Timer */}
      <Card className="p-6 rounded-2xl bg-gradient-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Currently Working On</p>
            <h3 className="text-2xl font-bold mt-1">
              {(() => {
                const p = presence.find((p) => p.user_id === profile?.id);
                const activeTaskId = p?.active_task_id;
                const active = tasks.find((t) => t.id === activeTaskId) || null;
                return active ? active.title : '—';
              })()}
            </h3>
            <p className="text-sm opacity-90 mt-2">{(() => {
              const p = presence.find((p) => p.user_id === profile?.id);
              return p?.last_heartbeat ? new Date(p.last_heartbeat).toLocaleTimeString() : '';
            })()}</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold">—</div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="rounded-xl">Pause</Button>
              <Button variant="outline" className="rounded-xl border-white text-white hover:bg-white/20">Stop</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* My Tasks */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">My Tasks</h2>
          <Link to="/app/employee/tasks">
            <Button variant="outline" className="rounded-xl">View All</Button>
          </Link>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:shadow-md transition-all bg-card">
              <div className="flex-1">
                <h3 className="font-medium">{task.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={(task.status || '').toLowerCase() === 'in_progress' ? "default" : "secondary"} className="rounded-lg">
                    {task.status}
                  </Badge>
                  <Badge variant={(task.priority || '').toLowerCase() === 'high' ? "destructive" : "secondary"} className="rounded-lg">
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</span>
                </div>
              </div>
              <Link to={`/app/employee/tasks/${task.id}`}>
                <Button variant="outline" size="sm" className="rounded-xl">View</Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Feed */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {timeEntries.map((te, i) => (
            <div key={te.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="font-medium">{te.is_break ? 'Break' : 'Work block'}</p>
                <p className="text-sm text-muted-foreground">{te.notes || (te.task_id ? `Task ${te.task_id}` : '')}</p>
              </div>
              <span className="text-xs text-muted-foreground">{te.start_time ? new Date(te.start_time).toLocaleTimeString() : ''}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}