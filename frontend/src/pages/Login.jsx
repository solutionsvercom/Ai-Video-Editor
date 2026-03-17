import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        await base44.auth.register({ email, password, full_name: fullName || email.split("@")[0] });
        toast.success("Account created. You are now signed in.");
      } else {
        await base44.auth.login({ email, password });
        toast.success("Signed in successfully.");
      }
      await refreshAuth();
      navigate(createPageUrl("Dashboard"));
    } catch (err) {
      toast.error(err?.payload?.error || err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f] text-white">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">{mode === "register" ? "Create account" : "Sign in"}</h1>
          <p className="text-gray-400 mb-6">
            {mode === "register" ? "Create a local account for this self-hosted app." : "Sign in to your local account."}
          </p>
        </motion.div>

        <Card className="glass-effect border-white/10 p-6">
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label className="mb-2 block">Full name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" required />
            </div>
            <div>
              <Label className="mb-2 block">Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" required />
            </div>

            <Button disabled={loading} className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0">
              {mode === "register" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-400">
            {mode === "register" ? (
              <button className="hover:text-white underline" onClick={() => setMode("login")} type="button">
                Already have an account? Sign in
              </button>
            ) : (
              <button className="hover:text-white underline" onClick={() => setMode("register")} type="button">
                New here? Create an account
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

