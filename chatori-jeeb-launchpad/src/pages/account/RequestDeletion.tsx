import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255, "Email is too long"),
  reason: z.string().trim().min(10, "Please provide reason (min 10 characters)").max(500, "Reason is too long (max 500 chars)"),
  confirmDelete: z.boolean().refine((val) => val === true, "Please confirm account deletion"),
});

type FormData = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Omit<FormData, 'confirmDelete'>, string>>;

export default function RequestDeletion() {
  const [data, setData] = useState<FormData>({
    email: "",
    reason: "",
    confirmDelete: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: string | boolean) => {
    setData((d) => ({ ...d, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Errors = {};
      result.error.issues.forEach((iss) => {
        const field = iss.path[0] as keyof Omit<FormData, 'confirmDelete'>;
        if (field && !fieldErrors[field]) fieldErrors[field] = iss.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/deletion/request-deletion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          reason: data.reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to submit deletion request");
        return;
      }

      setLoading(false);
      setSubmitted(true);
      toast.success("Deletion request submitted! We'll process it within 7 days.");
      setData({ email: "", reason: "", confirmDelete: false });
    } catch (error) {
      setLoading(false);
      toast.error("Error submitting deletion request. Please try again.");
      console.error(error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-gray-600 mb-4">
            Your account deletion request has been submitted successfully. We will process your request within 7 days.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to <strong>{data.email}</strong>
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Request Account Deletion</h1>
              <p className="text-gray-600 mt-2">
                We're sorry to see you go. Your account and all associated data will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-red-900 mb-2">Important:</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• This action is <strong>permanent and cannot be undone</strong></li>
              <li>• All your orders, reviews, and profile information will be deleted</li>
              <li>• You will have <strong>7 days</strong> to cancel this request</li>
              <li>• After 7 days, your account will be permanently deleted</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deletion *
              </label>
              <textarea
                value={data.reason}
                onChange={(e) => update("reason", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none ${
                  errors.reason ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Please tell us why you want to delete your account..."
                rows={4}
              />
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
              <p className="text-gray-500 text-xs mt-1">Minimum 10 characters</p>
            </div>

            {/* Confirmation Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.confirmDelete}
                  onChange={(e) => update("confirmDelete", e.target.checked)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500 mt-1"
                />
                <span className="text-sm text-gray-700">
                  I understand that my account and all data will be <strong>permanently deleted</strong> after 7 days, and I cannot undo this action.
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? "Submitting..." : "Request Deletion"}
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-gray-200 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li><strong>1.</strong> You'll receive a confirmation email</li>
              <li><strong>2.</strong> You have 7 days to cancel the deletion request</li>
              <li><strong>3.</strong> After 7 days, your account will be permanently deleted</li>
              <li><strong>4.</strong> You can create a new account anytime</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
