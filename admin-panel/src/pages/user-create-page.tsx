"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUsersStore } from "@/stores/useUsersStore";

export function UserCreatePage({ mode }: { mode: "admin" | "delivery" }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createAdmin, createDelivery, loading } = useUsersStore();

  const roleLabel = mode === "admin" ? "Admin" : "Delivery User";

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!email.includes("@")) newErrors.email = "Invalid email format";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    
    try {
      const payload = {
        name,
        email,
        phone,
        password,
        notes
      };

      const response = mode === "admin" 
        ? await createAdmin(payload)
        : await createDelivery(payload);

      if (response.success) {
        toast.success(`${roleLabel} created successfully.`);
        navigate(mode === "admin" ? "/users?role=admin" : "/users?role=delivery");
      }
    } catch (error: any) {
      console.error("User creation error:", error);
      const message = error.response?.data?.message || error.message || "An error occurred while creating the user.";
      toast.error(message);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <Card className="rounded-2xl shadow-sm border-0 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">New {roleLabel}</CardTitle>
          <p className="text-sm text-muted-foreground italic">Fill in the primary details to onboard a new {mode} account.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FormField label="Full Name" error={errors.name}>
            <Input 
              placeholder="e.g. John Doe"
              value={name} 
              onChange={(event) => setName(event.target.value)} 
              className="rounded-xl border-secondary/20 h-10"
            />
          </FormField>
          
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Email Address" error={errors.email}>
              <Input 
                type="email"
                placeholder="john@example.com"
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                className="rounded-xl border-secondary/20 h-10"
              />
            </FormField>
            <FormField label="Phone Number (Optional)">
              <Input 
                placeholder="+91 00000 00000"
                value={phone} 
                onChange={(event) => setPhone(event.target.value)} 
                className="rounded-xl border-secondary/20 h-10"
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Password" error={errors.password}>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={password} 
                  onChange={(event) => setPassword(event.target.value)} 
                  className="rounded-xl border-secondary/20 h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FormField>
            <FormField label="Confirm Password" error={errors.confirmPassword}>
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={confirmPassword} 
                onChange={(event) => setConfirmPassword(event.target.value)} 
                className="rounded-xl border-secondary/20 h-10"
              />
            </FormField>
          </div>

          <FormField label="Internal Notes (Optional)">
            <Textarea 
              value={notes} 
              onChange={(event) => setNotes(event.target.value)} 
              placeholder="Additional recruitment or background notes..." 
              className="rounded-xl border-secondary/20 min-h-[100px]"
            />
          </FormField>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-secondary/10">
            <Button 
              onClick={onSave} 
              disabled={loading}
              className="rounded-xl px-8 h-10 font-bold shadow-lg shadow-primary/20"
            >
              {loading ? "Onboarding..." : `Create ${roleLabel}`}
            </Button>
            <Button variant="ghost" asChild className="rounded-xl">
              <Link to="/users">Cancel and Return</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-sm border-0 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] text-primary">1</div>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Access Scope:</strong> {mode === "admin" 
                    ? "Full platform visibility. Can manage all restaurants, orders, and financial data." 
                    : "Limited to dispatch and delivery tracking modules only. No financial access."}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] text-primary">2</div>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Security:</strong> Newly created accounts are marked as <strong>ACTIVE</strong> by default. Force password reset if necessary through profile settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
