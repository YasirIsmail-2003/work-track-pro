import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Users, Search, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

const AdminEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    apiFetch('/api/admin/employees')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data.error) setError(data.error);
        else setEmployees(data.employees || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Employees</h1>
          <p className="text-muted-foreground">Manage your workforce</p>
        </div>
        <Button onClick={() => navigate("/app/admin/onboarding")}>
          <UserPlus className="w-4 h-4 mr-2" />
          Onboarding Queue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">93% attendance</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Hours/Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38.5h</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Timesheets & leaves</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Search by name, email, or ID..." className="flex-1" />
            <Button variant="outline">Active Only</Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>Click on an employee to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading && <div className="p-4">Loading...</div>}
            {error && <div className="p-4 text-red-600">{error}</div>}
            {!loading && !error && employees.length === 0 && <div className="p-4 text-muted-foreground">No employees found</div>}
            {!loading && !error && employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/app/admin/employees/${employee.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{employee.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{employee.employee_id || '—'}</span>
                      <span>•</span>
                      <span>{employee.phone || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{employee.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <Badge variant={employee.status === "ACTIVE" || employee.status === 'active' ? "default" : "outline"}>
                    {employee.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmployees;
