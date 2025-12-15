import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Zap,
  Infinity,
  Shield,
  MessageCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const Index = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const isLoggedIn = !!token;

  return (
    <div className="min-h-screen bg-hero-gradient overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#teams"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              For Teams
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Contact Us</Link>
            </Button>

            {isLoggedIn ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    window.location.reload();
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="teal" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Copy */}
            <div className="space-y-8 animate-fade-in-up">
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Where ideas <span className="text-gradient-teal">flow</span>{" "}
                freely
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                A workspace that moves with your ideas. Collaborate in
                real-time, manage projects seamlessly, and bring your vision to
                life.
              </p>
              <Button variant="teal" size="xl" asChild className="group">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Right side - Floating UI Elements */}
            <div className="relative h-[500px] hidden lg:block">
              {/* Chat snippet card */}
              <Card
                variant="glass-solid"
                className="absolute top-0 right-0 p-4 w-64 animate-float shadow-float"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" />
                    <AvatarFallback>DC</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">David Chen</p>
                    <p className="text-xs text-muted-foreground">
                      Just finished the feature spec!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" />
                    <AvatarFallback>EL</AvatarFallback>
                  </Avatar>
                </div>
              </Card>

              {/* Design Sprint badge */}
              <Card
                variant="glass-solid"
                className="absolute top-20 right-64 p-3 animate-float animation-delay-200"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="teal">Design Sprint</Badge>
                  <span className="text-xs text-muted-foreground">
                    In Progress
                  </span>
                </div>
              </Card>

              {/* Toolbar card */}
              <Card
                variant="glass-solid"
                className="absolute top-40 left-0 p-2 animate-float animation-delay-300"
              >
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>

              {/* Task preview */}
              <Card
                variant="glass-solid"
                className="absolute bottom-20 right-10 p-4 w-56 animate-float animation-delay-400"
              >
                <p className="text-sm font-medium mb-2">Finalizing slides</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  75% complete
                </p>
              </Card>

              {/* Collaboration active */}
              <Card
                variant="glass-solid"
                className="absolute bottom-0 left-10 p-3 animate-float animation-delay-500"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    4 collaborators online
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Wave transition */}
      <div className="relative h-24">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 100"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50C360 100 1080 0 1440 50V100H0V50Z"
            fill="white"
            fillOpacity="0.6"
          />
        </svg>
      </div>

      {/* Real-time section */}
      <section id="features" className="py-24 px-6 bg-white/60">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="teal" className="uppercase tracking-wider">
                Live Collaboration
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                Work together,{" "}
                <span className="text-gradient-teal">in real-time</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                See cursors move, edits form, and decisions happen as they
                unfold. No delays. No conflicts. Pure team sync.
              </p>
            </div>

            <div className="relative">
              <Card variant="glass-solid" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium">Team Sync</h3>
                  <Badge variant="success">Active Now</Badge>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      name: "Sarah Chen",
                      status: "Editing design file",
                      avatar:
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                    },
                    {
                      name: "Marcus Lee",
                      status: "Reviewing tasks",
                      avatar:
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                    },
                    {
                      name: "Emma Davis",
                      status: "In video call",
                      avatar:
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                    },
                  ].map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Everything you need section */}
      <section className="py-24 px-6 bg-hero-gradient">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Card variant="glass-solid" className="p-6 order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-sm font-medium">Workspace Canvas</p>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 h-20 rounded-lg bg-primary/10" />
                    <div className="flex-1 h-20 rounded-lg bg-amber-100" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge variant="glass">Tasks</Badge>
                  <Badge variant="glass">Chat</Badge>
                  <Badge variant="glass">Docs</Badge>
                </div>
              </div>
            </Card>

            <div className="space-y-6 order-1 lg:order-2">
              <Badge variant="teal" className="uppercase tracking-wider">
                All-in-One Canvas
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                Everything you need,{" "}
                <span className="text-gradient-teal">one space</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Whiteboard your ideas, chat with your team, manage tasks, and
                track progress – without switching tabs or losing context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for creators section */}
      <section id="teams" className="py-24 px-6 bg-white/60">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Built for <span className="text-gradient-teal">creators</span> and
            teams
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
            Experience a workspace that adapts to how you think – not the other
            way around.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Built to keep you in the zone. All features. No lag, no interruptions, just pure productivity.",
              },
              {
                icon: Infinity,
                title: "Infinite Canvas",
                description:
                  "Never run out of space. Your ideas deserve room to breathe and grow.",
              },
              {
                icon: Shield,
                title: "Secure by Default",
                description:
                  "Enterprise-grade security that doesn't get in your way. Your ideas stay yours.",
              },
            ].map((feature, i) => (
              <Card key={i} variant="glass-solid" className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-hero-gradient">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Start Creating Today
          </h2>
          <Button variant="teal" size="xl" asChild className="group">
            <Link to="/signup">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white/60 border-t border-white/30">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Built for the way you work.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
