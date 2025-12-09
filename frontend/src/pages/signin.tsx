import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";

const API_BASE = "http://localhost:1045/api/v1";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
        remember,
      });
      const token = res.data?.token;

      if (!token) {
        setError("Invalid response from server.");
        return;
      }
      if (remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
      setSuccess("Signed in successfully!");
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Unable to sign in. Please try again.");
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
              New here?
            </span>
            <Button variant="ghost" asChild>
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </div>

        <Card className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Sign in to continue to CollabFlow and pick up where you left
                off.
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Secure sign in</p>
                    <p className="text-xs text-muted-foreground">
                      We protect your account and data.
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
                      <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fast access</p>
                    <p className="text-xs text-muted-foreground">
                      Get back to work with a single click.
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
                  placeholder="Your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-sm underline">
                  Forgot password?
                </a>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="teal" className="w-full">
                  Sign in
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                By signing in you agree to our{" "}
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

export default Signin;
