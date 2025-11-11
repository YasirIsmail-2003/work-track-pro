import React from 'react';
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, LogIn, LogOut, Play, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TimeTracking() {
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [presence, setPresence] = useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const empRes = await fetch('/api/admin/employees');
        const empJson = await empRes.json();
        const firstEmployee = (empJson.employees || []).find((e: any) => e.role !== 'ADMIN') || (empJson.employees || [])[0] || null;
        if (!mounted) return;
        setProfile(firstEmployee);

        const [teRes, presRes] = await Promise.all([
          fetch('/api/admin/time_entries?limit=50'),
          fetch('/api/presence/now'),
        ]);
        const [teJson, presJson] = await Promise.all([teRes.json(), presRes.json()]);
        if (!mounted) return;
        const uid = firstEmployee?.id;
        setTimeEntries((teJson.time_entries || []).filter((t: any) => t.user_id === uid));
        setPresence(presJson.data || []);
      } catch (e) {
        console.error('TimeTracking load error', e);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const handleClockIn = () => {
    setIsClockedIn(true);
    toast({ title: "Clocked in", description: "Your work day has started" });
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    setIsTimerRunning(false);
    toast({ title: "Clocked out", description: "Your work day has ended" });
  };

  const handleBreakStart = () => {
    setIsOnBreak(true);
    setIsTimerRunning(false);
    toast({ title: "Break started", description: "Enjoy your break!" });
  };

  const handleBreakEnd = () => {
    setIsOnBreak(false);
    setIsTimerRunning(true);
    toast({ title: "Break ended", description: "Welcome back!" });
  };

  const todayActivities = (timeEntries || []).map((te) => ({
    time: te.start_time ? new Date(te.start_time).toLocaleTimeString() : '',
    action: te.is_break ? 'Break' : (te.task_id ? `Task ${te.task_id}` : 'Work block'),
    duration: te.end_time ? Math.round((new Date(te.end_time).getTime() - new Date(te.start_time).getTime()) / 60000) + ' min' : '-',
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Time Tracking</h1>
        <p className="text-muted-foreground">Track your work hours and breaks</p>
      </div>

      {/* Current Status */}
      <Card className="p-8 rounded-3xl bg-gradient-primary text-primary-foreground">
        <div className="text-center space-y-6">
          <div>
            <p className="text-sm opacity-90 mb-2">Current Status</p>
            <Badge 
              className={`text-lg px-6 py-2 rounded-2xl ${
                isOnBreak 
                  ? "bg-warning text-warning-foreground" 
                  : isClockedIn 
                  ? "bg-success text-success-foreground" 
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {isOnBreak ? "On Break" : isClockedIn ? "Working" : "Clocked Out"}
            </Badge>
          </div>

          <div>
            <p className="text-7xl font-bold tabular-nums">08:34:56</p>
            <p className="text-sm opacity-90 mt-2">Total Time Today</p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/10">
              <p className="text-2xl font-bold">6h 45m</p>
              <p className="text-xs opacity-90">Work Time</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10">
              <p className="text-2xl font-bold">45m</p>
              <p className="text-xs opacity-90">Break Time</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10">
              <p className="text-2xl font-bold">1h 5m</p>
              <p className="text-xs opacity-90">Idle Time</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 rounded-2xl bg-gradient-card">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Clock Controls
          </h3>
          <div className="space-y-3">
            {!isClockedIn ? (
              <Button 
                onClick={handleClockIn}
                className="w-full rounded-xl bg-gradient-success hover:opacity-90"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Clock In
              </Button>
            ) : (
              <Button 
                onClick={handleClockOut}
                className="w-full rounded-xl"
                variant="destructive"
                size="lg"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Clock Out
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-gradient-card">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            Break Controls
          </h3>
          <div className="space-y-3">
            {!isOnBreak ? (
              <Button 
                onClick={handleBreakStart}
                className="w-full rounded-xl"
                variant="outline"
                size="lg"
                disabled={!isClockedIn}
              >
                <Coffee className="w-5 h-5 mr-2" />
                Start Break
              </Button>
            ) : (
              <Button 
                onClick={handleBreakEnd}
                className="w-full rounded-xl bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                End Break
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Today's Timeline */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-6">Today's Timeline</h2>
        <div className="space-y-4">
          {todayActivities.map((activity, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
                {i !== todayActivities.length - 1 && (
                  <div className="w-0.5 h-12 bg-border" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{activity.action}</p>
                  <Badge variant="outline" className="rounded-lg">
                    {activity.time}
                  </Badge>
                </div>
                {activity.duration !== "-" && (
                  <p className="text-sm text-muted-foreground">Duration: {activity.duration}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Summary */}
      <Card className="p-6 rounded-2xl bg-gradient-card">
        <h2 className="text-xl font-bold mb-6">This Week Summary</h2>
        <div className="grid gap-4 md:grid-cols-5">
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
            <div key={day} className="p-4 rounded-xl border border-border text-center">
              <p className="text-sm text-muted-foreground mb-2">{day}</p>
              <p className="text-2xl font-bold">{8 + i % 3}h</p>
              <div className="mt-2 w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary" 
                  style={{ width: `${((8 + i % 3) / 8) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}