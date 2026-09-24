import { CardSkeleton } from "@/components/app/skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl space-y-6">
      <CardSkeleton lines={2} />
      <CardSkeleton lines={4} />
    </div>
  );
}
