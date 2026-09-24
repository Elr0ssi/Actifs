import { CardSkeleton } from "@/components/app/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <CardSkeleton lines={8} />
      <CardSkeleton lines={5} />
    </div>
  );
}
