import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
};

export function FormField({ label, htmlFor, description, error, children, className, required }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", error && "data-[invalid=true]", className)} data-invalid={Boolean(error)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
