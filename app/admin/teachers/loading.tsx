import TableSkeleton from '@/components/ui/TableSkeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}
