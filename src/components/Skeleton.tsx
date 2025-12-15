export function ProductSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 mt-8 pb-24">
        {[...Array(4)].map((_, i) => (
            <div
                key={i}
                className="h-40 rounded-lg bg-gray-200 animate-pulse"
            />
        ))}
        </div>
    );
}
