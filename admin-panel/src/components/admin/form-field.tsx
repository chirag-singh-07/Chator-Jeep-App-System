import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
};

export function FormField({ label, htmlFor, description, error, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", error && "data-[invalid=true]")} data-invalid={Boolean(error)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
