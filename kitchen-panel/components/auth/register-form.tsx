"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuthStore();
  
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Step 1
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Step 2
  const [kitchenName, setKitchenName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [foodType, setFoodType] = React.useState("both");

  // Step 3
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [pinCode, setPinCode] = React.useState("");

  // Step 4
  const [fssaiLicense, setFssaiLicense] = React.useState("");
  const [bankAccountHolder, setBankAccountHolder] = React.useState("");
  const [bankAccountNumber, setBankAccountNumber] = React.useState("");
  const [bankIfsc, setBankIfsc] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!email || !password) return setError("Fill all fields");
      if (password.length < 6) return setError("Password must be at least 6 characters");
    } else if (step === 2) {
      if (!kitchenName || !phone) return setError("Fill all fields");
      if (!/^[6-9]\d{9}$/.test(phone)) return setError("Invalid Indian phone number");
    } else if (step === 3) {
      if (!street || !city || !state || !pinCode) return setError("Fill all location fields");
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      return setError("You must accept the terms and conditions.");
    }

    setIsLoading(true);

    try {
      await register({
        email,
        password,
        ownerName: kitchenName,
        restaurantName: kitchenName,
        phone,
        cuisines: [foodType],
        fssaiLicense,
        address: {
          line1: street,
          city,
          state,
          pinCode,
        },
        bankDetails: {
          accountHolderName: bankAccountHolder,
          accountNumber: bankAccountNumber,
          ifscCode: bankIfsc,
          bankName: "Unknown"
        },
        termsAccepted
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[500px] px-4 md:px-0">
      <Card className="rounded-2xl border shadow-xl bg-card">
        <CardHeader className="space-y-1.5 p-6 pb-4">
          <CardTitle className="font-heading text-2xl font-black text-center text-foreground dark:text-zinc-50">
            Create Kitchen Account
          </CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            Step {step} of 4
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 space-y-5">
          {error && (
            <div className="p-3 text-xs font-semibold rounded-xl bg-destructive/10 text-destructive dark:bg-destructive/20 border border-destructive/20 text-left">
              {error}
            </div>
          )}

          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <HugeiconsIcon icon={showPassword ? EyeOffIcon : EyeIcon} size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-1.5">
                  <Label>Kitchen Name</Label>
                  <Input required value={kitchenName} onChange={(e) => setKitchenName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input required placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Food Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={foodType} onChange={(e) => setFoodType(e.target.value)}
                  >
                    <option value="both">Veg & Non-Veg</option>
                    <option value="veg">Pure Veg</option>
                    <option value="non-veg">Non-Veg Only</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-1.5">
                  <Label>Street Address</Label>
                  <Input required value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input required value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input required value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>PIN Code</Label>
                  <Input required value={pinCode} onChange={(e) => setPinCode(e.target.value)} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-1.5">
                  <Label>FSSAI License Number (Optional)</Label>
                  <Input value={fssaiLicense} onChange={(e) => setFssaiLicense(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Account Holder (Optional)</Label>
                  <Input value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Account Number (Optional)</Label>
                    <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>IFSC Code (Optional)</Label>
                    <Input value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <Label htmlFor="terms" className="text-xs">I accept the terms and conditions</Label>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev} className="flex-1">
                  Back
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="flex-1">
                {step === 4 ? (isLoading ? "Registering..." : "Submit Application") : "Next"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex justify-center border-t border-zinc-100 dark:border-zinc-900 py-4 text-xs">
          <span className="text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" onClick={(e) => { e.preventDefault(); router.push('/login'); }} className="font-bold text-primary hover:underline">
              Sign In
            </a>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
