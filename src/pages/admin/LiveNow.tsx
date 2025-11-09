import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Coffee, User, AlertCircle, Activity, Search, Bell } from "lucide-react";
import { useState } from "react";

type EmployeeStatus = "ON_TASK" | "ON_BREAK" | "IDLE" | "AFK" | "OFFLINE";

interface Employee {
  id: number;
  name: string;
  status: EmployeeStatus;
  activeTask?: string;
  timer: string;
  lastActivity: string;
  avatar: string;
}

export default function LiveNow() {
  const [searchQuery, setSearchQuery] = useState("");

  const employees: Employee[] = [
    {
      id: 1,
      name: "John Doe",
      status: "ON_TASK",
      activeTask: "Complete client website design",
      timer: "02:34:56",
      lastActivity: "Just now",
      avatar: "JD",
    },
    {
      id: 2,
      name: "Jane Smith",
      status: "ON_BREAK",
      timer: "00:12:45",
      lastActivity: "13 mins ago",
      avatar: "JS",
    },
    {
      id: 3,
      name: "Mike Johnson",
      status: "ON_TASK",
      activeTask: "Update database schemas",
      timer: "01:15:30",
      lastActivity: "2 mins ago",
      avatar: "MJ",
    },
    {
      id: 4,
      name: "Sarah Williams",
      status: "IDLE",
      timer: "00:00:00",
      lastActivity: "8 mins ago",
      avatar: "SW",
    },
    {
      id: 5,
      name: "Tom Brown",
      status: "AFK",
      timer: "00:45:20",
      lastActivity: "25 mins ago",
      avatar: "TB",
    },
    {
      id: 6,
      name: "Emily Davis",
      status: "OFFLINE",
      timer: "00:00:00",
      lastActivity: "3 hours ago",
      avatar: "ED",
    },
  ];

  const getStatusColor = (status: EmployeeStatus) => {
    const colors = {
      ON_TASK: "bg-success text-success-foreground",
      ON_BREAK: "bg-warning text-warning-foreground",
      IDLE: "bg-muted text-muted-foreground",
      AFK: "bg-destructive/70 text-destructive-foreground",
      OFFLINE: "bg-secondary text-secondary-foreground",
    };
    return colors[status];
  };

  const getStatusIcon = (status: EmployeeStatus) => {
    switch (status) {
      case "ON_TASK":
        return <Activity className="w-4 h-4" />;
      case "ON_BREAK":
        return <Coffee className="w-4 h-4" />;
      case "IDLE":
        return <Clock className="w-4 h-4" />;
      case "AFK":
        return <AlertCircle className="w-4 h-4" />;
      case "OFFLINE":
        return <User className="w-4 h-4" />;
    }
  };

  const stats = {
    onTask: employees.filter(e => e.status === "ON_TASK").length,
    onBreak: employees.filter(e => e.status === "ON_BREAK").length,
    idle: employees.filter(e => e.status === "IDLE").length,
    offline: employees.filter(e => e.status === "OFFLINE").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Activity Monitor</h1>
          <p className="text-muted-foreground">Real-time employee status and activity tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-xl relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 rounded-2xl bg-gradient-success text-success-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">On Task</p>
              <p className="text-3xl font-bold">{stats.onTask}</p>
            </div>
            <Activity className="w-8 h-8" />
          </div>
        </Card>
        <Card className="p-4 rounded-2xl bg-warning text-warning-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">On Break</p>
              <p className="text-3xl font-bold">{stats.onBreak}</p>
            </div>
            <Coffee className="w-8 h-8" />
          </div>
        </Card>
        <Card className="p-4 rounded-2xl bg-muted">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Idle</p>
              <p className="text-3xl font-bold">{stats.idle}</p>
            </div>
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4 rounded-2xl bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-foreground">Offline</p>
              <p className="text-3xl font-bold">{stats.offline}</p>
            </div>
            <User className="w-8 h-8 text-secondary-foreground" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 rounded-2xl bg-gradient-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </Card>

      {/* Employee Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {employees
          .filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((employee) => (
            <Card key={employee.id} className="p-6 rounded-2xl bg-gradient-card hover:shadow-lg transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                      {employee.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold">{employee.name}</h3>
                      <p className="text-xs text-muted-foreground">ID: #{employee.id}</p>
                    </div>
                  </div>
                  <Badge className={`rounded-lg ${getStatusColor(employee.status)} flex items-center gap-1`}>
                    {getStatusIcon(employee.status)}
                    {employee.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Active Task */}
                {employee.activeTask && (
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Active Task</p>
                    <p className="text-sm font-medium">{employee.activeTask}</p>
                  </div>
                )}

                {/* Timer */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Timer</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{employee.timer}</span>
                </div>

                {/* Last Activity */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last activity</span>
                  <span className="font-medium">{employee.lastActivity}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                    <Bell className="w-3 h-3 mr-1" />
                    Nudge
                  </Button>
                  {employee.status === "ON_TASK" && (
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                      Stop Timer
                    </Button>
                  )}
                  {employee.status === "ON_BREAK" && (
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                      End Break
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Alerts */}
      <Card className="p-6 rounded-2xl bg-destructive/10 border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-destructive mb-1">Attention Required</h3>
            <p className="text-sm text-muted-foreground">
              Tom Brown has been AFK for 25 minutes. Sarah Williams has been idle for 8 minutes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}