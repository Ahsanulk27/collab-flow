import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";

const API_BASE = "http://localhost:1045/api/v1";
const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password || !confirm) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/auth/signup`,
        {
          name,
          email,
          password,
        }
      );

    setSuccess("Account created successfully! You can now log in.");

    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <div>
            <span className="text-sm text-muted-foreground mr-4">
              Already have an account?
            </span>
            <Button variant="ghost" asChild>
              <Link to="/">Sign In</Link>
            </Button>
          </div>
        </div>

        <Card className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Create your account
              </h1>
              <p className="text-muted-foreground">
                Join CollabFlow — collaborate with your team, manage tasks, and
                move ideas forward.
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Teams-first</p>
                    <p className="text-xs text-muted-foreground">
                      Invite your teammates and collaborate instantly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 7h18M3 12h18M3 17h18" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">All-in-one</p>
                    <p className="text-xs text-muted-foreground">
                      Tasks, chat, and whiteboards in one place.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-sm text-rose-600">{error}</div>}
              {success && (
                <div className="text-sm text-emerald-600">{success}</div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Full name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-muted/40 px-3 py-2 bg-transparent"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-muted/40 px-3 py-2 bg-transparent"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-muted/40 px-3 py-2 bg-transparent"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-md border border-muted/40 px-3 py-2 bg-transparent"
                  placeholder="Repeat password"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="teal" className="w-full">
                  Create account
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <a className="underline" href="#">
                  Terms
                </a>{" "}
                and{" "}
                <a className="underline" href="#">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
