import React from 'react';
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Play, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmployeeTasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tasks, setTasks] = useState<any[]>([]);
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

        const res = await fetch('/api/admin/tasks');
        const json = await res.json();
        if (!mounted) return;
        const uid = firstEmployee?.id;
        setTasks((json.tasks || []).filter((t: any) => t.assignee === uid));
      } catch (e) {
        console.error('EmployeeTasks load error', e);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline", label: string }> = {
      in_progress: { variant: "default", label: "In Progress" },
      pending: { variant: "secondary", label: "Pending" },
      review: { variant: "outline", label: "In Review" },
    };
    return variants[status] || variants.pending;
  };

  const getPriorityColor = (priority: string) => {
    return priority === "high" ? "destructive" : priority === "medium" ? "warning" : "secondary";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">Manage and track your assignments</p>
        </div>
        <Button className="rounded-xl bg-gradient-primary hover:opacity-90">
          <Play className="w-4 h-4 mr-2" />
          Start Timer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 rounded-2xl bg-gradient-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4 rounded-2xl bg-gradient-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
        </Card>
        <Card className="p-4 rounded-2xl bg-gradient-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Review</p>
              <p className="text-2xl font-bold">1</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
        </Card>
        <Card className="p-4 rounded-2xl bg-gradient-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">25/58</p>
            </div>
            <Clock className="w-8 h-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-6 rounded-2xl bg-gradient-card hover:shadow-lg transition-all">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <Link to={`/app/employee/tasks/${task.id}`}>
                      <h3 className="font-bold text-lg hover:text-primary transition-colors">{task.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">Client: {task.client}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge 
                        variant={getStatusBadge(task.status).variant as any}
                        className="rounded-lg"
                      >
                        {getStatusBadge(task.status).label}
                      </Badge>
                      <Badge 
                        variant={getPriorityColor(task.priority) as any}
                        className="rounded-lg"
                      >
                        {task.priority.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {task.due}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        {task.hours} hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {task.status === "pending" && (
                  <Button className="rounded-xl bg-gradient-success hover:opacity-90">
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                )}
                {task.status === "in_progress" && (
                  <Button variant="outline" className="rounded-xl">
                    Complete
                  </Button>
                )}
                <Link to={`/app/employee/tasks/${task.id}`}>
                  <Button variant="outline" className="rounded-xl">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}