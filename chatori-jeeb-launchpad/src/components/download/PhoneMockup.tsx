import { ReactNode } from "react";

type Props = { children?: ReactNode; label?: string };

export const PhoneMockup = ({ children, label = "App preview" }: Props) => {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto w-[260px] md:w-[300px] aspect-[9/19] rounded-[2.5rem] bg-foreground p-3 shadow-elegant"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-b-2xl z-10" aria-hidden />
      <div className="h-full w-full rounded-[2rem] overflow-hidden bg-gradient-warm relative">
        {children ?? (
          <div className="absolute inset-0 bg-gradient-primary opacity-90" aria-hidden />
        )}
      </div>
    </div>
  );
};