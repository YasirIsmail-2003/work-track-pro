import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, Clock, Calendar, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const taskData = [
  { name: "Pending", value: 12 },
  { name: "In Progress", value: 8 },
  { name: "Review", value: 5 },
  { name: "Completed", value: 23 },
];

const hoursData = [
  { week: "Week 1", hours: 180 },
  { week: "Week 2", hours: 210 },
  { week: "Week 3", hours: 195 },
  { week: "Week 4", hours: 225 },
];

export default function AdminDashboard() {
  const pendingApprovals = [
    { id: 1, type: "Timesheet", employee: "John Doe", detail: "Week of Jan 8-14", hours: "42h" },
    { id: 2, type: "Leave", employee: "Jane Smith", detail: "Jan 25-27", days: "3 days" },
    { id: 3, type: "Onboarding", employee: "Mike Johnson", detail: "New employee", status: "Pending docs" },
  ];

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