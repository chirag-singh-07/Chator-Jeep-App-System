"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Bike, CreditCard, User } from "lucide-react";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeliveryPartnerStore } from "@/stores/useDeliveryPartnerStore";

const indianPhoneRegex = /^[6-9]\d{9}$/;
const vehicleNumberRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;
const dlRegex = /^[A-Z]{2}\d{2}\s?\d{11}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

type VehicleType = "Bike" | "Cycle" | "Car";
type FuelType = "Petrol" | "EV";
type PayoutMethod = "UPI" | "BANK_ACCOUNT";

export function DeliveryPartnerCreatePage() {
  const navigate = useNavigate();
  const { createPartner, isCreating } = useDeliveryPartnerStore();

  // Account details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Vehicle details
  const [vehicleType, setVehicleType] = useState<VehicleType>("Bike");
  const [vehicleFuelType, setVehicleFuelType] = useState<FuelType>("Petrol");
  const [bikeNumber, setBikeNumber] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");

  // Payout details
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("UPI");
  const [upiId, setUpiId] = useState("");
  const [bankHolderName, setBankHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Address
  const [buildingName, setBuildingName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Options
  const [autoApprove, setAutoApprove] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Account validation
    if (!name.trim() || name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!phone.trim() || !indianPhoneRegex.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Vehicle validation
    if (!vehicleNumberRegex.test(bikeNumber.toUpperCase().replace(/\s/g, ""))) {
      newErrors.bikeNumber = "Invalid vehicle number format (e.g., GJ01AB1234)";
    }
    if (!dlRegex.test(drivingLicense.toUpperCase().replace(/\s/g, ""))) {
      newErrors.drivingLicense = "Invalid driving license format";
    }

    // Payout validation
    if (payoutMethod === "UPI") {
      if (!upiRegex.test(upiId)) {
        newErrors.upiId = "Enter a valid UPI ID (e.g., name@upi)";
      }
    } else {
      if (!bankHolderName.trim() || bankHolderName.trim().length < 3) {
        newErrors.bankHolderName = "Enter valid account holder name";
      }
      if (!bankName.trim() || bankName.trim().length < 3) {
        newErrors.bankName = "Enter valid bank name";
      }
      if (accountNumber.length < 9 || accountNumber.length > 18) {
        newErrors.accountNumber = "Enter a valid account number (9-18 digits)";
      }
      if (!ifscRegex.test(ifscCode.toUpperCase())) {
        newErrors.ifscCode = "Enter a valid IFSC code (e.g., HDFC0001234)";
      }
    }

    // Address validation
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!/^\d{6}$/.test(pincode)) newErrors.pincode = "Enter a valid 6-digit PIN code";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
        vehicleType,
        vehicleFuelType,
        bikeNumber: bikeNumber.toUpperCase().replace(/\s/g, ""),
        drivingLicense: drivingLicense.toUpperCase().replace(/\s/g, ""),
        payoutMethod,
        upiId: payoutMethod === "UPI" ? upiId.trim() : undefined,
        bankDetails:
          payoutMethod === "BANK_ACCOUNT"
            ? {
                accountHolderName: bankHolderName.trim(),
                bankName: bankName.trim(),
                accountNumber: accountNumber.trim(),
                ifscCode: ifscCode.toUpperCase().trim(),
              }
            : undefined,
        address: {
          buildingName: buildingName.trim(),
          streetName: streetName.trim(),
          landmark: landmark.trim(),
          area: area.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        autoApprove,
      };

      const response = await createPartner(payload);

      if (response.success) {
        toast.success("Delivery partner created successfully!");
        navigate("/delivery-agents");
      }
    } catch (error: any) {
      console.error("Partner creation error:", error);
      const message = error.message || "Failed to create delivery partner";
      toast.error(message);
    }
  };

  const normalizeVehicleNumber = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Delivery Partner</h1>
          <p className="text-muted-foreground">
            Create a new delivery partner account with login credentials
          </p>
        </div>
        <Button variant="ghost" asChild className="rounded-xl">
          <Link to="/delivery-agents">← Back to Partners</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account Details */}
        <Card className="rounded-3xl border-none shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField label="Full Name *" error={errors.name}>
              <Input
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-secondary/20 h-11"
              />
            </FormField>

            <FormField label="Email Address *" error={errors.email}>
              <Input
                type="email"
                placeholder="rahul@chatorijeeb.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-secondary/20 h-11"
              />
            </FormField>

            <FormField label="Phone Number *" error={errors.phone}>
              <Input
                placeholder="10 digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="rounded-xl border-secondary/20 h-11"
              />
            </FormField>

            <div className="grid gap-4 grid-cols-2">
              <FormField label="Password *" error={errors.password}>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-secondary/20 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm Password *" error={errors.confirmPassword}>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl border-secondary/20 h-11"
                />
              </FormField>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl">
              <input
                type="checkbox"
                id="autoApprove"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="size-5 rounded accent-primary"
              />
              <Label htmlFor="autoApprove" className="text-sm cursor-pointer">
                Auto-approve partner (skip verification)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card className="rounded-3xl border-none shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Bike className="h-5 w-5 text-orange-500" />
              </div>
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField label="Vehicle Type *">
              <div className="grid grid-cols-3 gap-2">
                {(["Bike", "Cycle", "Car"] as VehicleType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVehicleType(type)}
                    className={`h-11 rounded-xl border-2 font-bold transition-all ${
                      vehicleType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-secondary/20 hover:border-secondary/40"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Fuel Type *">
              <div className="grid grid-cols-2 gap-2">
                {(["Petrol", "EV"] as FuelType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVehicleFuelType(type)}
                    className={`h-11 rounded-xl border-2 font-bold transition-all ${
                      vehicleFuelType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-secondary/20 hover:border-secondary/40"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Vehicle Number *" error={errors.bikeNumber}>
              <Input
                placeholder="GJ01AB1234"
                value={bikeNumber}
                onChange={(e) => setBikeNumber(normalizeVehicleNumber(e.target.value))}
                className="rounded-xl border-secondary/20 h-11 uppercase"
              />
            </FormField>

            <FormField label="Driving License *" error={errors.drivingLicense}>
              <Input
                placeholder="GJ0120231234567"
                value={drivingLicense}
                onChange={(e) => setDrivingLicense(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 16))}
                className="rounded-xl border-secondary/20 h-11 uppercase"
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Payout & Address */}
        <Card className="rounded-3xl border-none shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              Payout Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField label="Payout Method *">
              <div className="grid grid-cols-2 gap-2">
                {(["UPI", "BANK_ACCOUNT"] as PayoutMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayoutMethod(method)}
                    className={`h-11 rounded-xl border-2 font-bold transition-all ${
                      payoutMethod === method
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-secondary/20 hover:border-secondary/40"
                    }`}
                  >
                    {method === "UPI" ? "UPI ID" : "Bank Account"}
                  </button>
                ))}
              </div>
            </FormField>

            {payoutMethod === "UPI" ? (
              <FormField label="UPI ID *" error={errors.upiId}>
                <Input
                  placeholder="rahul@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="rounded-xl border-secondary/20 h-11"
                />
              </FormField>
            ) : (
              <>
                <FormField label="Account Holder Name *" error={errors.bankHolderName}>
                  <Input
                    placeholder="Rahul Sharma"
                    value={bankHolderName}
                    onChange={(e) => setBankHolderName(e.target.value)}
                    className="rounded-xl border-secondary/20 h-11"
                  />
                </FormField>
                <FormField label="Bank Name *" error={errors.bankName}>
                  <Input
                    placeholder="HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="rounded-xl border-secondary/20 h-11"
                  />
                </FormField>
                <FormField label="Account Number *" error={errors.accountNumber}>
                  <Input
                    placeholder="123456789012"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 18))}
                    className="rounded-xl border-secondary/20 h-11"
                  />
                </FormField>
                <FormField label="IFSC Code *" error={errors.ifscCode}>
                  <Input
                    placeholder="HDFC0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11))}
                    className="rounded-xl border-secondary/20 h-11 uppercase"
                  />
                </FormField>
              </>
            )}

            <div className="border-t pt-4 mt-2">
              <FormField label="City *" error={errors.city}>
                <Input
                  placeholder="Ahmedabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl border-secondary/20 h-11"
                />
              </FormField>
              <FormField label="State *" error={errors.state}>
                <Input
                  placeholder="Gujarat"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-xl border-secondary/20 h-11 mt-3"
                />
              </FormField>
              <FormField label="PIN Code *" error={errors.pincode}>
                <Input
                  placeholder="380009"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="rounded-xl border-secondary/20 h-11 mt-3"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <Button
          onClick={onSave}
          disabled={isCreating}
          className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20"
        >
          {isCreating ? "Creating Partner..." : "Create Delivery Partner"}
        </Button>
        <Button variant="ghost" asChild className="rounded-xl">
          <Link to="/delivery-agents">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}