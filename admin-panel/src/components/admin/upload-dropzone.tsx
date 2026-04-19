"use client";

import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  preview?: string;
  onChange: (value: string) => void;
};

export function UploadDropzone({ preview, onChange }: UploadDropzoneProps) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-6 text-center transition",
        "hover:border-primary hover:bg-primary/5"
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
          onChange(URL.createObjectURL(file));
        }
      }}
    >
      {preview ? (
        <img src={preview} alt="Preview" className="h-28 w-28 rounded-2xl object-cover shadow-sm" />
      ) : (
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ImagePlus />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-medium">Drag and drop an image</p>
        <p className="text-sm text-muted-foreground">Paste an image URL below or drop a file here for instant preview.</p>
      </div>
    </div>
  );
}
