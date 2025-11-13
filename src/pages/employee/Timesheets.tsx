import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Download, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";

export default function Timesheets() {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [timesheets, setTimesheets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const empRes = await apiFetch('/api/admin/employees');
        const empJson = await empRes.json();
        const firstEmployee = (empJson.employees || []).find((e: any) => e.role !== 'ADMIN') || (empJson.employees || [])[0] || null;
        if (!mounted) return;
        setProfile(firstEmployee);

        const tsRes = await apiFetch('/api/admin/timesheets');
        const tsJson = await tsRes.json();
        if (!mounted) return;
        const uid = firstEmployee?.id;
        setTimesheets((tsJson.timesheets || []).filter((t: any) => t.user_id === uid));
      } catch (e) {
        console.error('Timesheets load error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const handleSubmit = () => {
    toast({
      title: "Timesheet submitted",
      description: "Your timesheet has been sent for approval",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your timesheet is being downloaded",
    });
  };

  const currentWeek = timesheets[0] || null;
  const previousTimesheets = timesheets.slice(1);

  const [dailyBreakdown, setDailyBreakdown] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    async function loadDaily() {
      if (!profile || !currentWeek) return;
      try {
        const teRes = await apiFetch('/api/admin/time_entries?limit=500');
        const teJson = await teRes.json();
        const entries = (teJson.time_entries || []).filter((e: any) => e.user_id === profile.id);

        const weekStart = currentWeek.week_start ? new Date(currentWeek.week_start) : null;
        const weekEnd = currentWeek.week_end ? new Date(currentWeek.week_end) : null;
        // build a map keyed by date string
        const map: Record<string, { day: string; date: string; hours: number; tasks: Set<string>; breaks: number }> = {};
        entries.forEach((en: any) => {
          if (!en.start_time) return;
          const st = new Date(en.start_time);
          if (weekStart && weekEnd && (st < weekStart || st > weekEnd)) return;
          const key = st.toLocaleDateString();
          if (!map[key]) map[key] = { day: st.toLocaleString(undefined, { weekday: 'long' }), date: key, hours: 0, tasks: new Set(), breaks: 0 };
          const durationMs = en.end_time ? (new Date(en.end_time).getTime() - new Date(en.start_time).getTime()) : 0;
          map[key].hours += durationMs / (1000 * 60 * 60);
          if (en.task_id) map[key].tasks.add(en.task_id);
          if (en.is_break) map[key].breaks += 1;
        });

        const arr = Object.values(map).map((v) => ({ day: v.day, date: v.date, hours: `${v.hours.toFixed(2)}h`, tasks: v.tasks.size, breaks: `${v.breaks}x` }));
        if (mounted) setDailyBreakdown(arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      } catch (e) {
        console.error('daily breakdown load error', e);
      }
    }
    loadDaily();
    return () => { mounted = false };
  }, [profile, currentWeek]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timesheets</h1>
          <p className="text-muted-foreground">Review and submit your work hours</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="rounded-xl">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Current Week Summary */}
      <Card className="p-8 rounded-3xl bg-gradient-primary text-primary-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <p className="text-sm opacity-90">Current Period</p>
            </div>
            <h2 className="text-3xl font-bold mb-1">{currentWeek.period}</h2>
            <Badge className="bg-white/20 text-white rounded-lg">
              {currentWeek.status.toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{currentWeek.totalHours}</p>
              <p className="text-sm opacity-90 mt-1">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{currentWeek.regularHours}</p>
              <p className="text-sm opacity-90 mt-1">Regular</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-warning">{currentWeek.overtime}</p>
              <p className="text-sm opacity-90 mt-1">Overtime</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Breakdown */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-6">Daily Breakdown</h2>
        <div className="space-y-3">
          {dailyBreakdown.map((entry, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border hover:shadow-md transition-all bg-card gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold">{entry.day}</h3>
                  <span className="text-sm text-muted-foreground">{entry.date}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <strong>{entry.hours}</strong> worked
                  </span>
                  <span className="text-muted-foreground">{entry.tasks} tasks</span>
                  <span className="text-muted-foreground">{entry.breaks} breaks</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                View Details
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <h3 className="font-bold mb-2">Ready to submit?</h3>
            <p className="text-sm text-muted-foreground">
              Review your hours and submit for approval. Your manager will be notified.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl">
              Save Draft
            </Button>
            <Button onClick={handleSubmit} className="rounded-xl bg-gradient-primary hover:opacity-90">
              <Send className="w-4 h-4 mr-2" />
              Submit Timesheet
            </Button>
          </div>
        </div>
      </Card>

      {/* Previous Timesheets */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-6">Previous Timesheets</h2>
        <div className="space-y-3">
          {previousTimesheets.map((sheet, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
            >
              <div>
                <h3 className="font-medium">{sheet.period}</h3>
                <p className="text-sm text-muted-foreground">Submitted on {sheet.submittedOn}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold">{sheet.totalHours}</p>
                  <Badge 
                    variant={sheet.status === "approved" ? "default" : "secondary"}
                    className="rounded-lg"
                  >
                    {sheet.status}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}