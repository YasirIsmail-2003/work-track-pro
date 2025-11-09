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
            <Route path="employees" element={<div>Employees - Coming soon</div>} />
            <Route path="employees/:id" element={<div>Employee Details - Coming soon</div>} />
            <Route path="onboarding" element={<div>Onboarding - Coming soon</div>} />
            <Route path="tasks" element={<div>Tasks Management - Coming soon</div>} />
            <Route path="clients" element={<div>Clients - Coming soon</div>} />
            <Route path="timesheets" element={<div>Timesheets Approval - Coming soon</div>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;