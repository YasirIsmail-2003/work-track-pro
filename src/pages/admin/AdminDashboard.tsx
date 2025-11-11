import React from 'react';
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, Clock, Calendar, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminDashboard() {
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [timesheets, setTimesheets] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [tRes, tsRes, eRes] = await Promise.all([
          fetch('/api/admin/tasks'),
          fetch('/api/admin/timesheets'),
          fetch('/api/admin/employees'),
        ]);
        const [tJson, tsJson, eJson] = await Promise.all([tRes.json(), tsRes.json(), eRes.json()]);
        if (!mounted) return;
        setTasks(tJson.tasks || []);
        setTimesheets(tsJson.timesheets || []);
        setEmployees(eJson.employees || []);
      } catch (err) {
        console.error('AdminDashboard load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const taskData = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'Review', value: tasks.filter(t => t.status === 'REVIEW').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'DONE').length },
  ];

  const hoursData = (() => {
    // Aggregate weekly hours from timesheets (take last 4)
    const weeks = timesheets.slice(0,4).map((ts:any, idx:number)=>({ week: `Week ${idx+1}`, hours: Number(ts.total_hours || 0) }));
    return weeks.length ? weeks : [{ week: 'Week 1', hours: 0 }];
  })();

  const pendingApprovals = [
    // Build a small approvals list from timesheets/leaves/onboarding if available
    ...timesheets.filter(ts => ts.status === 'DRAFT').slice(0,3).map((ts:any,i:number)=>({ id: `ts-${i}`, type: 'Timesheet', employee: employees.find((e:any)=>e.id===ts.user_id)?.full_name || ts.user_id, detail: `Week ${ts.week_start}`, hours: `${ts.total_hours}h` })),
  ];

  const topPerformers = employees.slice(0,3).map((e:any,i:number)=>({ name: e.full_name || e.employee_id || String(i+1), tasks: tasks.filter((t:any)=>t.assignee===e.id).length, hours: timesheets.filter((ts:any)=>ts.user_id===e.id).reduce((s:any, x:any)=>s+Number(x.total_hours||0),0), efficiency: '—' }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Company-wide overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Pending Approvals"
          value="15"
          icon={CheckCircle2}
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Active Employees"
          value="48"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Hours This Week"
          value="1,850"
          icon={Clock}
        />
        <StatsCard
          title="Leaves Pending"
          value="7"
          icon={Calendar}
        />
        <StatsCard
          title="Utilization Rate"
          value="87%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 rounded-2xl bg-gradient-card">
          <h2 className="text-xl font-bold mb-4">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 rounded-2xl bg-gradient-card">
          <h2 className="text-xl font-bold mb-4">Hours per Week</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hoursData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="hsl(var(--success))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--success))", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Link to="/app/admin/now">
            <Button className="w-full rounded-xl bg-gradient-primary hover:opacity-90" size="lg">
              <Activity className="w-5 h-5 mr-2" />
              Live Now
            </Button>
          </Link>
          <Link to="/app/admin/onboarding">
            <Button className="w-full rounded-xl" variant="outline" size="lg">
              <Users className="w-5 h-5 mr-2" />
              Review Onboarding
            </Button>
          </Link>
          <Link to="/app/admin/timesheets">
            <Button className="w-full rounded-xl" variant="outline" size="lg">
              <Clock className="w-5 h-5 mr-2" />
              Approve Timesheets
            </Button>
          </Link>
          <Link to="/app/admin/tasks">
            <Button className="w-full rounded-xl" variant="outline" size="lg">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Manage Tasks
            </Button>
          </Link>
        </div>
      </Card>

      {/* Pending Approvals */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Pending Approvals</h2>
          <Badge className="rounded-lg">15 items</Badge>
        </div>

        <div className="space-y-3">
          {pendingApprovals.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:shadow-md transition-all bg-card"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="rounded-lg">{item.type}</Badge>
                <div>
                  <h3 className="font-medium">{item.employee}</h3>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.hours && <span className="text-sm font-medium">{item.hours}</span>}
                {item.days && <span className="text-sm font-medium">{item.days}</span>}
                <Button variant="default" size="sm" className="rounded-xl">
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-4 rounded-xl">
          View All Approvals
        </Button>
      </Card>

      {/* Team Performance */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-4">Top Performers This Week</h2>
        <div className="space-y-3">
          {[
            { name: "John Doe", tasks: 12, hours: "45h", efficiency: "98%" },
            { name: "Jane Smith", tasks: 10, hours: "42h", efficiency: "95%" },
            { name: "Mike Johnson", tasks: 9, hours: "40h", efficiency: "92%" },
          ].map((person, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-medium">{person.name}</h3>
                  <p className="text-sm text-muted-foreground">{person.tasks} tasks • {person.hours}</p>
                </div>
              </div>
              <Badge className="rounded-lg bg-gradient-success">{person.efficiency} Efficiency</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}