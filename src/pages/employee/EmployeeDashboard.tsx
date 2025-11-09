import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, DollarSign, AlertCircle, Play, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmployeeDashboard() {
  const tasks = [
    { id: 1, title: "Complete client website design", status: "in_progress", priority: "high", due: "2024-01-15" },
    { id: 2, title: "Review project documentation", status: "pending", priority: "medium", due: "2024-01-16" },
    { id: 3, title: "Update database schemas", status: "pending", priority: "low", due: "2024-01-18" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, John!</h1>
        <p className="text-muted-foreground">Here's your activity overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Tasks"
          value="12"
          icon={CheckCircle2}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Hours Today"
          value="6.5h"
          icon={Clock}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Earnings (Week)"
          value="₹4,500"
          icon={DollarSign}
        />
        <StatsCard
          title="Hour Limit Used"
          value="68%"
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
            <h3 className="text-2xl font-bold mt-1">Client Website Design</h3>
            <p className="text-sm opacity-90 mt-2">Started 2 hours ago</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold">2:34:56</div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="rounded-xl">
                Pause
              </Button>
              <Button variant="outline" className="rounded-xl border-white text-white hover:bg-white/20">
                Stop
              </Button>
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
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:shadow-md transition-all bg-card"
            >
              <div className="flex-1">
                <h3 className="font-medium">{task.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={task.status === "in_progress" ? "default" : "secondary"} className="rounded-lg">
                    {task.status === "in_progress" ? "In Progress" : "Pending"}
                  </Badge>
                  <Badge 
                    variant={task.priority === "high" ? "destructive" : "secondary"}
                    className="rounded-lg"
                  >
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Due: {task.due}</span>
                </div>
              </div>
              <Link to={`/app/employee/tasks/${task.id}`}>
                <Button variant="outline" size="sm" className="rounded-xl">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Feed */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "Completed task", detail: "Website mockup review", time: "2 hours ago" },
            { action: "Clocked in", detail: "Started work day", time: "8 hours ago" },
            { action: "Leave approved", detail: "Jan 25-26 vacation", time: "Yesterday" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="font-medium">{item.action}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}