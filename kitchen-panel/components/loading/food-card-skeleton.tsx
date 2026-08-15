import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FoodCardSkeleton() {
  return (
    <Card className="rounded-2xl border shadow-xs flex flex-col h-full bg-card overflow-hidden select-none">
      {/* Image Container Skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Card Header Skeleton */}
      <CardHeader className="space-y-2 p-5 pb-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-[60%] rounded-md" />
          <Skeleton className="h-5 w-[15%] rounded-md" />
        </div>
        <Skeleton className="h-3.5 w-[30%] rounded-md" />
      </CardHeader>

      {/* Card Content Skeleton */}
      <CardContent className="p-5 flex-grow space-y-4">
        {/* Description line skeletons */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-[92%] rounded-md" />
          <Skeleton className="h-4 w-[75%] rounded-md" />
        </div>
        
        {/* Divider & Price skeletons */}
        <div className="pt-4 border-t flex items-center justify-between">
          <Skeleton className="h-6 w-[25%] rounded-md" />
          <Skeleton className="h-4 w-[35%] rounded-md" />
        </div>
      </CardContent>

      {/* Card Footer Skeleton */}
      <CardFooter className="p-5 pt-0">
        <Skeleton className="h-10 w-full rounded-full" />
      </CardFooter>
    </Card>
  );
}
