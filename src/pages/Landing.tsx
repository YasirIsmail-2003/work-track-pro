import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Zap, Shield, CheckCircle2, Phone, MapPin, ExternalLink, Upload } from "lucide-react";
import heroImage from "@/assets/hero-workplace.jpg";
import { toast } from "@/hooks/use-toast";

export default function Landing() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: authMode === "login" ? "Login successful" : "Account created",
      description: "Redirecting to dashboard...",
    });
    setTimeout(() => navigate("/app/employee"), 1000);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Admin login successful",
      description: "Redirecting to admin dashboard...",
    });
    setTimeout(() => navigate("/app/admin"), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  WorkTrack Pro
                </h1>
                <p className="text-xl text-muted-foreground">
                  Employee & task management with client-verified completion and live activity tracking
                </p>
                <p className="text-sm text-muted-foreground">by BAK Group</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 shadow-glow rounded-2xl"
                  onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-2xl"
                  onClick={() => window.open('https://bakgroup.net', '_blank')}
                >
                  Learn More
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:shadow-md transition-all">
                  <Database className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium text-center">Supabase Powered</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:shadow-md transition-all">
                  <Zap className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium text-center">Real-time Sync</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:shadow-md transition-all">
                  <Shield className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium text-center">OTP Secured</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:shadow-md transition-all">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium text-center">Verified Tasks</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <img 
                src={heroImage} 
                alt="WorkTrack Pro Dashboard" 
                className="rounded-3xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="container mx-auto px-4 py-16">
        <Tabs defaultValue="employee" className="max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl">
            <TabsTrigger value="employee" className="rounded-xl text-base">Employee</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-xl text-base">Admin</TabsTrigger>
          </TabsList>

          {/* Employee Auth */}
          <TabsContent value="employee" className="mt-6">
            <Card className="p-8 rounded-3xl shadow-lg bg-gradient-card">
              <div className="flex justify-center gap-4 mb-6">
                <Button
                  variant={authMode === "login" ? "default" : "outline"}
                  onClick={() => setAuthMode("login")}
                  className="rounded-2xl"
                >
                  Login
                </Button>
                <Button
                  variant={authMode === "signup" ? "default" : "outline"}
                  onClick={() => setAuthMode("signup")}
                  className="rounded-2xl"
                >
                  Sign Up
                </Button>
              </div>

              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required className="rounded-xl" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required className="rounded-xl" />
                </div>

                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+973 1234 5678" required className="rounded-xl" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required className="rounded-xl" />
                </div>

                {authMode === "signup" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" required className="rounded-xl" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document">Identity Document (Aadhaar/ID)</Label>
                      <div className="flex items-center gap-2 p-4 rounded-xl border border-input bg-muted/50">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Upload after admin verification (secure storage)
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full rounded-2xl bg-gradient-primary hover:opacity-90" size="lg">
                  {authMode === "login" ? "Login" : "Create Account"}
                </Button>

                {authMode === "login" && (
                  <Button type="button" variant="link" className="w-full">
                    Forgot Password?
                  </Button>
                )}
              </form>
            </Card>
          </TabsContent>

          {/* Admin Auth */}
          <TabsContent value="admin" className="mt-6">
            <Card className="p-8 rounded-3xl shadow-lg bg-gradient-card">
              <h3 className="text-2xl font-bold text-center mb-6">Admin Login</h3>
              
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input id="admin-email" type="email" placeholder="admin@bakgroup.net" required className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input id="admin-password" type="password" required className="rounded-xl" />
                </div>

                <Button type="submit" className="w-full rounded-2xl bg-gradient-primary hover:opacity-90" size="lg">
                  Admin Login
                </Button>

                <Button type="button" variant="link" className="w-full">
                  Forgot Password?
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Company Info Section */}
      <section className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">BAK Group</h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+973 1773 1717</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Bahrain (Head Office)</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                <a 
                  href="https://bakgroup.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  bakgroup.net
                </a>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              P.O. Box 20489, Capital Governorate, Kingdom of Bahrain
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}