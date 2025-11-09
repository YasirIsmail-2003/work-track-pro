import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Download, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Timesheets() {
  const currentWeek = {
    period: "Jan 8 - Jan 14, 2024",
    totalHours: "42h 30m",
    regularHours: "40h",
    overtime: "2h 30m",
    status: "draft",
  };

  const dailyBreakdown = [
    { day: "Monday", date: "Jan 8", hours: "8h 30m", tasks: 3, breaks: "45m" },
    { day: "Tuesday", date: "Jan 9", hours: "8h", tasks: 2, breaks: "30m" },
    { day: "Wednesday", date: "Jan 10", hours: "9h", tasks: 4, breaks: "1h" },
    { day: "Thursday", date: "Jan 11", hours: "8h", tasks: 3, breaks: "45m" },
    { day: "Friday", date: "Jan 12", hours: "9h", tasks: 3, breaks: "1h" },
  ];

  const previousTimesheets = [
    { period: "Jan 1-7", totalHours: "40h", status: "approved", submittedOn: "Jan 8, 2024" },
    { period: "Dec 25-31", totalHours: "35h", status: "approved", submittedOn: "Jan 1, 2024" },
    { period: "Dec 18-24", totalHours: "38h", status: "approved", submittedOn: "Dec 25, 2023" },
  ];

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