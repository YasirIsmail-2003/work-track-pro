import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import { AppLayout } from "./components/layout/AppLayout";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeTasks from "./pages/employee/EmployeeTasks";
import TaskDetails from "./pages/employee/TaskDetails";
import TimeTracking from "./pages/employee/TimeTracking";
import Timesheets from "./pages/employee/Timesheets";
import LeaveManagement from "./pages/employee/LeaveManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LiveNow from "./pages/admin/LiveNow";
import AdminEmployees from "./pages/admin/Employees";
import EmployeeDetail from "./pages/admin/EmployeeDetail";
import AdminOnboarding from "./pages/admin/Onboarding";
import AdminTasks from "./pages/admin/Tasks";
import AdminClients from "./pages/admin/Clients";
import AdminTimesheets from "./pages/admin/Timesheets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Employee Routes */}
          <Route path="/app/employee" element={<AppLayout role="employee" />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="tasks/:id" element={<TaskDetails />} />
            <Route path="time" element={<TimeTracking />} />
            <Route path="timesheets" element={<Timesheets />} />
            <Route path="leave" element={<LeaveManagement />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/app/admin" element={<AppLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="now" element={<LiveNow />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="onboarding" element={<AdminOnboarding />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="timesheets" element={<AdminTimesheets />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;