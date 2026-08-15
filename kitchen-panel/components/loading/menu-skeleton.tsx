import { FoodCardSkeleton } from "./food-card-skeleton";

export function MenuSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
      {[...Array(6)].map((_, i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  );
}
