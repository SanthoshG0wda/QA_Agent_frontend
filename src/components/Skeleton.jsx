export function CardSkeleton() {
  return <div className="card p-6 space-y-4">
    <div className="skeleton h-4 w-28" />
    <div className="skeleton h-10 w-20" />
  </div>
}

export function TableSkeleton({ rows = 5 }) {
  return <div className="card overflow-hidden">
    <div className="p-5 border-b border-surface-border">
      <div className="skeleton h-5 w-40" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-5 border-b border-surface-border flex gap-5">
        <div className="skeleton h-5 flex-1" />
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-5 w-24" />
      </div>
    ))}
  </div>
}

export function EvalSkeleton() {
  return <div className="space-y-6">
    <div className="card p-10 text-center">
      <div className="skeleton h-24 w-40 mx-auto rounded-full" />
      <div className="skeleton h-5 w-32 mx-auto mt-5" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-3 w-full" />
        </div>
      ))}
    </div>
  </div>
}
