export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-bg-disabled rounded ${className}`} />
  );
}
