import { BrandedLoader } from "@/components/loading/branded-loader";

export default function Loading() {
  return (
    <div className="flex flex-1 min-h-screen items-center justify-center bg-background font-sans p-6">
      <BrandedLoader />
    </div>
  );
}
