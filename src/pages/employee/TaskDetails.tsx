import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Play, Pause, CheckCircle2, Clock, FileText, Paperclip, MessageSquare, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TaskDetails() {
  const { id } = useParams();
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  const task = {
    id: id,
    title: "Complete client website design",
    objective: "Design and implement a modern, responsive website for the client with focus on user experience and brand identity",
    status: "in_progress",
    priority: "high",
    dueDate: "2024-01-15",
    client: "Acme Corp",
    assignedDate: "2024-01-10",
    estimatedHours: "20h",
    actualHours: "12h",
    description: "Create a comprehensive website design including homepage, about page, services, and contact sections. Ensure mobile responsiveness and follow brand guidelines provided by the client.",
    attachments: [
      { name: "Brand_Guidelines.pdf", size: "2.4 MB" },
      { name: "Reference_Design.fig", size: "5.1 MB" },
    ],
    comments: [
      { user: "Admin", text: "Please prioritize the homepage design first", time: "2 hours ago" },
      { user: "You", text: "Working on it. Will have the draft ready by EOD", time: "1 hour ago" },
    ],
  };

  const handleCompleteTask = () => {
    // Simulate OTP verification
    toast({
      title: "Task completed!",
      description: "Client has been notified for verification.",
    });
    setOtpDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/employee/tasks">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <p className="text-muted-foreground">Task #{task.id}</p>
        </div>
        <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="rounded-lg text-sm px-3 py-1">
          {task.priority.toUpperCase()} PRIORITY
        </Badge>
      </div>

      {/* Action Bar */}
      <Card className="p-6 rounded-2xl bg-gradient-primary text-primary-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-90">Current Timer</p>
            <p className="text-4xl font-bold">02:34:56</p>
            <p className="text-sm opacity-90 mt-1">Total: {task.actualHours} / {task.estimatedHours}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="rounded-xl"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="rounded-xl border-white text-white hover:bg-white/20">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Mark Complete
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Enter Client OTP</DialogTitle>
                  <DialogDescription>
                    Please enter the OTP provided by the client to verify task completion.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">6-Digit OTP</Label>
                    <Input
                      id="otp"
                      placeholder="000000"
                      maxLength={6}
                      className="rounded-xl text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button onClick={handleCompleteTask} className="w-full rounded-xl" size="lg">
                    Verify & Complete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Information */}
          <Card className="p-6 rounded-2xl bg-gradient-card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Task Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Objective</h3>
                <p className="text-muted-foreground">{task.objective}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-muted-foreground">{task.description}</p>
              </div>
            </div>
          </Card>

          {/* Attachments */}
          <Card className="p-6 rounded-2xl bg-gradient-card">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Attachments</h2>
            </div>
            <div className="space-y-2">
              {task.attachments.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Comments */}
          <Card className="p-6 rounded-2xl bg-gradient-card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Comments</h2>
            </div>
            <div className="space-y-4">
              {task.comments.map((comment, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl border border-border bg-card">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                    {comment.user[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{comment.user}</p>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea placeholder="Add a comment..." className="rounded-xl" />
                <Button className="rounded-xl">Send</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          <Card className="p-6 rounded-2xl bg-gradient-card">
            <h2 className="text-xl font-bold mb-4">Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant="default" className="rounded-lg">In Progress</Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Client</p>
                <p className="font-medium">{task.client}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {task.dueDate}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned Date</p>
                <p className="font-medium">{task.assignedDate}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time Tracking</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estimated</span>
                    <span className="font-medium">{task.estimatedHours}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Actual</span>
                    <span className="font-medium text-primary">{task.actualHours}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-primary" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-gradient-success text-success-foreground">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm opacity-90 mb-4">Contact your admin if you have questions about this task.</p>
            <Button variant="secondary" className="w-full rounded-xl">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Admin
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}