"use client";

import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

type UploadDropzoneProps = {
  preview?: string;
  onChange: (value: string) => void;
  folder?: string;
};

export function UploadDropzone({ preview, onChange, folder = "menu-items" }: UploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("profiles", "full"); // request full size

      const response = await apiClient.post("/uploads/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const urls = response.data.data.urls;
      // Use the full url if available, otherwise fallback to whatever profile was generated
      const uploadedUrl = urls.full || urls.medium || urls.default || Object.values(urls)[0];
      
      if (uploadedUrl && typeof uploadedUrl === 'string') {
         onChange(uploadedUrl);
         toast.success("Image uploaded successfully");
      } else {
         toast.error("Failed to extract image URL from response");
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-6 text-center transition",
        "hover:border-primary hover:bg-primary/5",
        isUploading && "opacity-70 pointer-events-none"
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
          handleUpload(file);
        }
      }}
    >
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        onChange={(e) => {
           const file = e.target.files?.[0];
           if (file) handleUpload(file);
        }}
        accept="image/*"
      />
      {isUploading ? (
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : preview ? (
        <img src={preview} alt="Preview" className="h-28 w-28 rounded-2xl object-cover shadow-sm pointer-events-none" />
      ) : (
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary pointer-events-none">
          <ImagePlus />
        </div>
      )}
      <div className="flex flex-col gap-1 pointer-events-none">
        <p className="font-medium">{isUploading ? "Uploading..." : "Click or drag to upload"}</p>
        <p className="text-sm text-muted-foreground">Upload image directly or paste a URL below.</p>
      </div>
    </div>
  );
}
