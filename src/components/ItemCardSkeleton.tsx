export function ItemCardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Image */}
            <div className="w-full h-48 bg-gray-200 rounded-lg" />

            {/* Tag */}
            <div className="mt-2">
                <div className="w-12 h-4 bg-gray-200 rounded" />
            </div>

            {/* Title */}
            <div className="mt-2 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
    );
}
