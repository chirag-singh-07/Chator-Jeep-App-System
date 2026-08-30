"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  EyeIcon,
  EyeOffIcon,
  Mail01Icon,
  LockPasswordIcon,
  Store01Icon,
  Call02Icon,
  SpoonAndForkIcon,
  Home01Icon,
  Location01Icon,
  CreditCardIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ImageUploadIcon,
  IdentityCardIcon,
  Shield01Icon,
  Camera02Icon,
  BankIcon,
  FileValidationIcon,
} from "@hugeicons/core-free-icons";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Step config ─────────────────────────── */
const STEPS = [
  { id: 1, label: "Account", shortLabel: "1", icon: Mail01Icon },
  { id: 2, label: "Kitchen", shortLabel: "2", icon: Store01Icon },
  { id: 3, label: "Media", shortLabel: "3", icon: ImageUploadIcon },
  { id: 4, label: "Location", shortLabel: "4", icon: Location01Icon },
  { id: 5, label: "Identity", shortLabel: "5", icon: IdentityCardIcon },
  { id: 6, label: "Business", shortLabel: "6", icon: FileValidationIcon },
  { id: 7, label: "Selfie", shortLabel: "7", icon: Camera02Icon },
  { id: 8, label: "Finish", shortLabel: "8", icon: BankIcon },
];

/* ─────────────────────────── Helpers ─────────────────────────── */
const inputCls =
  "py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-300 shadow-sm text-sm";

interface FieldProps {
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  optional?: boolean;
}

function Field({ id, label, icon, children, hint, optional }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
      >
        {icon && (
          <HugeiconsIcon icon={icon} size={12} strokeWidth={2} className="text-primary/70" />
        )}
        {label}
        {optional && (
          <span className="ml-1 normal-case text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
            optional
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-zinc-400 pl-1">{hint}</p>}
    </div>
  );
}

/* ── File Upload Component ── */
interface FileUploadProps {
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  accept?: string;
  value: File | null;
  onChange: (f: File | null) => void;
  hint?: string;
  optional?: boolean;
  capture?: "user" | "environment";
}

function FileUpload({ id, label, icon, accept = "image/*", value, onChange, hint, optional, capture }: FileUploadProps) {
  const preview = value ? URL.createObjectURL(value) : null;
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Field id={id} label={label} icon={icon} hint={hint} optional={optional}>
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden group",
          value
            ? "border-primary/40 bg-primary/5"
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        {preview ? (
          <div className="relative w-full h-36">
            <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold">Change File</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-zinc-400">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {icon ? (
                <HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} />
              ) : (
                <HugeiconsIcon icon={ImageUploadIcon} size={20} strokeWidth={1.5} />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-zinc-500">Click to upload</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG or JPEG</p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          capture={capture}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[11px] text-destructive/70 hover:text-destructive font-medium pl-1 transition-colors"
        >
          × Remove file
        </button>
      )}
    </Field>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */
export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuthStore();

  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Step 1 — Account
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Step 2 — Kitchen
  const [kitchenName, setKitchenName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [foodType, setFoodType] = React.useState("both");

  // Step 3 — Media
  const [kitchenLogo, setKitchenLogo] = React.useState<File | null>(null);
  const [kitchenBanner, setKitchenBanner] = React.useState<File | null>(null);

  // Step 4 — Location
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [stateName, setStateName] = React.useState("");
  const [pinCode, setPinCode] = React.useState("");

  // Step 5 — Identity (KYC)
  const [aadharCardNumber, setAadharCardNumber] = React.useState("");
  const [aadharCardImage, setAadharCardImage] = React.useState<File | null>(null);
  const [panCardNumber, setPanCardNumber] = React.useState("");
  const [panCardImage, setPanCardImage] = React.useState<File | null>(null);

  // Step 6 — Business Docs
  const [GSTNumber, setGSTNumber] = React.useState("");
  const [GSTImage, setGSTImage] = React.useState<File | null>(null);
  const [addressProofImage, setAddressProofImage] = React.useState<File | null>(null);

  // Step 7 — Selfie
  const [LiveFaceImage, setLiveFaceImage] = React.useState<File | null>(null);

  // Step 8 — Financial & Terms
  const [fssaiLicense, setFssaiLicense] = React.useState("");
  const [bankAccountHolder, setBankAccountHolder] = React.useState("");
  const [bankAccountNumber, setBankAccountNumber] = React.useState("");
  const [bankIfsc, setBankIfsc] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  /* ── Validation ── */
  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!email || !password) return setError("Please fill in your email and password.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
    } else if (step === 2) {
      if (!kitchenName || !phone) return setError("Kitchen name and phone are required.");
      if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    } else if (step === 4) {
      if (!street || !city || !stateName || !pinCode) return setError("Fill in all location fields.");
      if (!/^\d{6}$/.test(pinCode)) return setError("PIN code must be exactly 6 digits.");
    } else if (step === 5) {
      if (!aadharCardNumber) return setError("Aadhaar number is required.");
      if (!/^\d{12}$/.test(aadharCardNumber.replace(/\s/g, ""))) return setError("Enter a valid 12-digit Aadhaar number.");
      if (!aadharCardImage) return setError("Please upload your Aadhaar card image.");
      if (!panCardNumber) return setError("PAN number is required.");
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCardNumber.toUpperCase())) return setError("Enter a valid PAN number (e.g. ABCDE1234F).");
      if (!panCardImage) return setError("Please upload your PAN card image.");
    } else if (step === 6) {
      if (!addressProofImage) return setError("Please upload an address proof document.");
    } else if (step === 7) {
      if (!LiveFaceImage) return setError("Please upload a clear selfie photo.");
    }
    setStep((s) => s + 1);
  };

  const handlePrev = () => { setError(null); setStep((s) => s - 1); };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!termsAccepted) return setError("Please accept the terms and conditions.");
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
        address: { line1: street, city, state: stateName, pinCode },
        bankDetails: {
          accountHolderName: bankAccountHolder,
          accountNumber: bankAccountNumber,
          ifscCode: bankIfsc,
          bankName: "Unknown",
        },
        termsAccepted,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full max-w-[500px] px-4 md:px-0 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="flex flex-col space-y-6">

        {/* ── Header ── */}
        <div className="space-y-3">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center lg:hidden select-none mb-2">
            <div className="p-2 bg-primary/20 border border-primary/30 rounded-xl shadow-lg shadow-primary/20 shrink-0">
              <Image src={IMAGES.logo} alt="logo" width={20} height={20} className="rounded-full w-5 h-5 object-contain" priority />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground dark:text-zinc-50">
              Chatori Jeep<span className="text-primary font-sans font-light"> Kitchen</span>
            </span>
          </div>
          <div className="text-center lg:text-left">
            <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground dark:text-white">
              Partner with us
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your kitchen profile — step {step} of {STEPS.length}
            </p>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="space-y-3">
          {/* Mini step dots */}
          <div className="flex items-center justify-between gap-1">
            {STEPS.map((s) => {
              const isComplete = step > s.id;
              const isActive = step === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  title={s.label}
                  onClick={() => isComplete && setStep(s.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 group",
                    isComplete ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isComplete
                        ? "bg-primary border-primary shadow-sm shadow-primary/30 group-hover:scale-110"
                        : isActive
                          ? "bg-primary/10 border-primary scale-110 shadow-sm shadow-primary/20"
                          : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                    )}
                  >
                    {isComplete ? (
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} strokeWidth={2.5} className="text-white" />
                    ) : (
                      <HugeiconsIcon
                        icon={s.icon}
                        size={13}
                        strokeWidth={2}
                        className={isActive ? "text-primary" : "text-zinc-400"}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wide hidden sm:block",
                      isActive ? "text-primary" : isComplete ? "text-primary/60" : "text-zinc-300 dark:text-zinc-600"
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Continuous progress bar */}
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-center text-zinc-400 font-medium">
            {STEPS[step - 1].label} — {Math.round(progress)}% complete
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="p-4 text-sm font-semibold rounded-2xl bg-destructive/10 text-destructive dark:bg-destructive/20 border border-destructive/20 animate-in fade-in-50 slide-in-from-top-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
            {error}
          </div>
        )}

        {/* ── Success ── */}
        {success && (
          <div className="p-4 text-sm font-semibold rounded-2xl bg-green-500/10 text-green-600 dark:bg-green-500/20 border border-green-500/20 animate-in fade-in-50 flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} strokeWidth={2} />
            Account created! Redirecting to your dashboard…
          </div>
        )}

        {/* ── Step Form Card ── */}
        <div className="rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
          {/* Step label bar */}
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <HugeiconsIcon icon={STEPS[step - 1].icon} size={16} strokeWidth={2} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Step {step} of {STEPS.length}</p>
              <p className="text-sm font-black text-foreground dark:text-zinc-100">{STEPS[step - 1].label}</p>
            </div>
          </div>

          <form
            onSubmit={step === 8 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
            className="p-6 space-y-5"
          >
            {/* ──────── Step 1: Account ──────── */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <Field id="email" label="Email Address" icon={Mail01Icon}>
                  <Input
                    id="email" type="email" required disabled={isLoading}
                    placeholder="kitchen@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field id="password" label="Password" icon={LockPasswordIcon} hint="Minimum 6 characters">
                  <div className="relative">
                    <Input
                      id="password" type={showPassword ? "text" : "password"} required disabled={isLoading}
                      placeholder="Create a strong password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className={cn(inputCls, "pr-12")}
                    />
                    <button
                      type="button" disabled={isLoading}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide" : "Show"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors focus:outline-none"
                    >
                      <HugeiconsIcon icon={showPassword ? EyeOffIcon : EyeIcon} size={18} strokeWidth={2} />
                    </button>
                  </div>
                </Field>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={Shield01Icon} size={15} strokeWidth={2} className="text-primary mt-0.5 shrink-0" />
                  <p>Your data is encrypted and secured. We never share your information with third parties.</p>
                </div>
              </div>
            )}

            {/* ──────── Step 2: Kitchen Info ──────── */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <Field id="kitchenName" label="Kitchen / Restaurant Name" icon={Store01Icon}>
                  <Input
                    id="kitchenName" required disabled={isLoading}
                    placeholder="e.g. Chatori Jeep — MG Road"
                    value={kitchenName} onChange={(e) => setKitchenName(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field id="phone" label="Mobile Number" icon={Call02Icon} hint="10-digit Indian number">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500 select-none">+91</span>
                    <Input
                      id="phone" required disabled={isLoading}
                      placeholder="98XXXXXXXX" maxLength={10}
                      value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className={cn(inputCls, "pl-12")}
                    />
                  </div>
                </Field>
                <Field id="foodType" label="Food Type" icon={SpoonAndForkIcon}>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "veg", emoji: "🌿", label: "Pure Veg" },
                      { value: "non-veg", emoji: "🍗", label: "Non-Veg" },
                      { value: "both", emoji: "🍽️", label: "Both" },
                    ].map((opt) => (
                      <button
                        key={opt.value} type="button" onClick={() => setFoodType(opt.value)}
                        className={cn(
                          "py-3 px-2 rounded-2xl border-2 text-center transition-all duration-200",
                          foodType === opt.value
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-primary/40 bg-zinc-50 dark:bg-zinc-900"
                        )}
                      >
                        <div className="text-lg mb-0.5">{opt.emoji}</div>
                        <div className="text-[10px] font-bold">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {/* ──────── Step 3: Media ──────── */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <HugeiconsIcon icon={ImageUploadIcon} size={14} strokeWidth={2} className="shrink-0 mt-0.5" />
                  <p>Upload your kitchen logo and a banner image. These will appear on your public profile. Both are optional for now.</p>
                </div>
                <FileUpload
                  id="kitchenLogo" label="Kitchen Logo" icon={Store01Icon}
                  value={kitchenLogo} onChange={setKitchenLogo} optional
                  hint="Square image recommended (PNG/JPG)"
                />
                <FileUpload
                  id="kitchenBanner" label="Kitchen Banner" icon={ImageUploadIcon}
                  value={kitchenBanner} onChange={setKitchenBanner} optional
                  hint="Wide image 1280×400 recommended"
                />
              </div>
            )}

            {/* ──────── Step 4: Location ──────── */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <Field id="street" label="Street Address" icon={Home01Icon}>
                  <Input
                    id="street" required disabled={isLoading}
                    placeholder="Building, Street, Area"
                    value={street} onChange={(e) => setStreet(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="city" label="City">
                    <Input
                      id="city" required disabled={isLoading} placeholder="e.g. Mumbai"
                      value={city} onChange={(e) => setCity(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field id="state" label="State">
                    <Input
                      id="state" required disabled={isLoading} placeholder="e.g. Maharashtra"
                      value={stateName} onChange={(e) => setStateName(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field id="pinCode" label="PIN Code" icon={Location01Icon} hint="6-digit postal code">
                  <Input
                    id="pinCode" required disabled={isLoading}
                    placeholder="400001" maxLength={6}
                    value={pinCode} onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}

            {/* ──────── Step 5: Identity KYC ──────── */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                  <HugeiconsIcon icon={Shield01Icon} size={14} strokeWidth={2} className="shrink-0 mt-0.5" />
                  <p>Identity verification is required by FSSAI regulations. Your documents are stored securely and never shared.</p>
                </div>
                {/* Aadhaar */}
                <div className="space-y-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Aadhaar Card</p>
                  <Field id="aadharNumber" label="Aadhaar Number" icon={IdentityCardIcon}>
                    <Input
                      id="aadharNumber" required disabled={isLoading}
                      placeholder="XXXX XXXX XXXX" maxLength={14}
                      value={aadharCardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setAadharCardNumber(v.replace(/(.{4})(?=.)/g, "$1 "));
                      }}
                      className={inputCls}
                    />
                  </Field>
                  <FileUpload
                    id="aadharImage" label="Upload Aadhaar Image" icon={IdentityCardIcon}
                    value={aadharCardImage} onChange={setAadharCardImage}
                    hint="Clear photo of front side"
                  />
                </div>
                {/* PAN */}
                <div className="space-y-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">PAN Card</p>
                  <Field id="panNumber" label="PAN Number" icon={CreditCardIcon}>
                    <Input
                      id="panNumber" required disabled={isLoading}
                      placeholder="ABCDE1234F" maxLength={10}
                      value={panCardNumber}
                      onChange={(e) => setPanCardNumber(e.target.value.toUpperCase())}
                      className={inputCls}
                    />
                  </Field>
                  <FileUpload
                    id="panImage" label="Upload PAN Image" icon={CreditCardIcon}
                    value={panCardImage} onChange={setPanCardImage}
                    hint="Clear photo of your PAN card"
                  />
                </div>
              </div>
            )}

            {/* ──────── Step 6: Business Docs ──────── */}
            {step === 6 && (
              <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/30 text-xs text-purple-700 dark:text-purple-400 flex items-start gap-2">
                  <HugeiconsIcon icon={FileValidationIcon} size={14} strokeWidth={2} className="shrink-0 mt-0.5" />
                  <p>GST registration is optional. Address proof (utility bill, rent agreement) is required.</p>
                </div>
                <div className="space-y-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">GST Details <span className="normal-case font-medium text-zinc-400">(optional)</span></p>
                  <Field id="gstNumber" label="GST Number" icon={FileValidationIcon} optional>
                    <Input
                      id="gstNumber" disabled={isLoading}
                      placeholder="22AAAAA0000A1Z5"
                      value={GSTNumber} onChange={(e) => setGSTNumber(e.target.value.toUpperCase())}
                      className={inputCls}
                    />
                  </Field>
                  <FileUpload
                    id="gstImage" label="Upload GST Certificate" icon={FileValidationIcon}
                    value={GSTImage} onChange={setGSTImage} optional
                    hint="Upload GST registration certificate"
                  />
                </div>
                <FileUpload
                  id="addressProof" label="Address Proof Document" icon={Home01Icon}
                  value={addressProofImage} onChange={setAddressProofImage}
                  hint="Utility bill, rent agreement, or bank statement"
                />
              </div>
            )}

            {/* ──────── Step 7: Live Selfie ──────── */}
            {step === 7 && (
              <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <HugeiconsIcon icon={Camera02Icon} size={18} strokeWidth={2} className="text-green-600 dark:text-green-400" />
                    <p className="font-bold text-green-700 dark:text-green-400">Face Verification</p>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-500 leading-relaxed">
                    Take a clear selfie or upload a recent photo. Make sure your face is clearly visible, well-lit, and not wearing sunglasses.
                  </p>
                </div>
                <FileUpload
                  id="liveFace" label="Your Selfie / Face Photo" icon={Camera02Icon}
                  value={LiveFaceImage} onChange={setLiveFaceImage}
                  capture="user"
                  hint="Clear, well-lit photo of your face"
                />
                {/* Tips */}
                <div className="grid grid-cols-3 gap-2">
                  {["Good lighting ✅", "Face centered ✅", "No sunglasses ✅"].map((tip) => (
                    <div key={tip} className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500 font-medium text-center">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ──────── Step 8: Financial & Finish ──────── */}
            {step === 8 && (
              <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
                  <p className="font-bold text-foreground dark:text-zinc-200 text-sm flex items-center gap-2">
                    <HugeiconsIcon icon={BankIcon} size={16} strokeWidth={2} className="text-primary" />
                    Almost done! 🎉
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    These fields are <span className="font-semibold text-foreground">optional</span> — fill them later from your dashboard.
                  </p>
                </div>
                <Field id="fssai" label="FSSAI License Number" icon={FileValidationIcon} optional>
                  <Input
                    id="fssai" disabled={isLoading}
                    placeholder="e.g. 10012345678901"
                    value={fssaiLicense} onChange={(e) => setFssaiLicense(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="space-y-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bank Details <span className="normal-case font-medium">(optional)</span></p>
                  <Field id="bankHolder" label="Account Holder Name" icon={BankIcon} optional>
                    <Input
                      id="bankHolder" disabled={isLoading}
                      placeholder="As per bank records"
                      value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="bankAccNo" label="Account Number" optional>
                      <Input
                        id="bankAccNo" disabled={isLoading}
                        placeholder="Account no."
                        value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field id="ifsc" label="IFSC Code" optional>
                      <Input
                        id="ifsc" disabled={isLoading}
                        placeholder="SBIN0001234"
                        value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>

                {/* Custom Terms Checkbox */}
                <label
                  htmlFor="terms"
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none",
                    termsAccepted
                      ? "border-primary bg-primary/5"
                      : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 hover:border-primary/40"
                  )}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox" id="terms"
                      checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
                      termsAccepted ? "bg-primary border-primary" : "border-zinc-300 dark:border-zinc-600"
                    )}>
                      {termsAccepted && (
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} strokeWidth={2.5} className="text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <span className="font-bold text-primary underline">Terms & Conditions</span> and{" "}
                    <span className="font-bold text-primary underline">Privacy Policy</span> of Chatori Jeep.
                  </span>
                </label>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button
                  type="button" variant="outline" onClick={handlePrev}
                  disabled={isLoading || success}
                  className="flex-1 rounded-2xl py-6 font-bold border-2 gap-1.5 hover:bg-muted/50 transition-all duration-200"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={2.5} />
                  Back
                </Button>
              )}
              <Button
                type="submit" disabled={isLoading || success}
                className="flex-1 rounded-2xl py-6 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 gap-2 group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : step === 8 ? (
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={17} strokeWidth={2.5} />
                    Create My Kitchen
                  </span>
                ) : step === 3 ? (
                  <span className="flex items-center gap-2">
                    {kitchenLogo || kitchenBanner ? "Next" : "Skip for now"}
                    <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue
                    <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-sm text-muted-foreground pt-1">
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => { e.preventDefault(); router.push("/login"); }}
            className="font-bold text-primary hover:underline transition-all"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
