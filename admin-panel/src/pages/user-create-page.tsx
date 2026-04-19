"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function UserCreatePage({ mode }: { mode: "admin" | "delivery" }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const roleLabel = mode === "admin" ? "Admin" : "Delivery User";
  const nameError = submitted && !name.trim() ? `${roleLabel} name is required.` : "";
  const emailError = submitted && !email.trim() ? "Email is required." : "";

  const onSave = () => {
    setSubmitted(true);
    if (!name.trim() || !email.trim()) return;
    toast.success(`${roleLabel} created.`);
    navigate(`/users?role=${mode}`);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Create {roleLabel}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FormField label={`${roleLabel} Name`} error={nameError}>
            <Input value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(nameError)} />
          </FormField>
          <FormField label="Email" error={emailError}>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(emailError)} />
          </FormField>
          <FormField label="Phone">
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </FormField>
          <FormField label="Notes">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional internal onboarding notes..." />
          </FormField>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onSave}>Create {roleLabel}</Button>
            <Button variant="outline" asChild>
              <Link to="/users">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Access Scope</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          {mode === "admin" ? (
            <>
              <p>Admins can access the full SaaS workspace including users, restaurants, categories, and payments.</p>
              <p>Use this flow only for trusted internal operators.</p>
            </>
          ) : (
            <>
              <p>Delivery users are created here for dispatch and rider management flows.</p>
              <p>They should not receive admin workspace permissions.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
