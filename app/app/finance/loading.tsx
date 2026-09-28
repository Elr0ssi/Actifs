import { CardSkeleton } from "@/components/app/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <CardSkeleton lines={4} />
      <CardSkeleton lines={4} />
    </div>
  );
}
