import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="rounded-2xl border-dashed shadow-sm">
      <CardHeader className="items-center text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {actionLabel ? (
        <CardContent className="flex justify-center pt-0">
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
