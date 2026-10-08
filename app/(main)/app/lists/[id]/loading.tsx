import { CardSkeleton } from "@/components/app/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <CardSkeleton lines={6} />
    </div>
  );
}
