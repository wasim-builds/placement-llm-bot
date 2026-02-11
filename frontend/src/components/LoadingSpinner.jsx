// Reusable loading spinner component with multiple variants
export default function LoadingSpinner({
    size = 'md',
    variant = 'spinner',
    overlay = false,
    message = ''
}) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const spinnerContent = () => {
        switch (variant) {
            case 'dots':
                return (
                    <div className="flex items-center gap-2">
                        <div className={`${sizes[size]} rounded-full bg-primary animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`${sizes[size]} rounded-full bg-primary animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`${sizes[size]} rounded-full bg-primary animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                );

            case 'pulse':
                return (
                    <div className={`${sizes[size]} rounded-full bg-primary animate-pulse-slow`}></div>
                );

            case 'spinner':
            default:
                return (
                    <div className={`${sizes[size]} border-4 border-slate-700 border-t-primary rounded-full animate-spin`}></div>
                );
        }
    };

    const content = (
        <div className="flex flex-col items-center gap-3">
            {spinnerContent()}
            {message && (
                <p className="text-slate-400 text-sm font-medium animate-pulse">{message}</p>
            )}
        </div>
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="glass-strong rounded-xl p-8">
                    {content}
                </div>
            </div>
        );
    }

    return content;
}

// Skeleton loader for content placeholders
export function SkeletonLoader({ className = '', count = 1 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`skeleton rounded-lg ${className}`}
                    style={{ animationDelay: `${i * 100}ms` }}
                ></div>
            ))}
        </>
    );
}

// Card skeleton for loading states
export function CardSkeleton({ count = 3 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center justify-between">
                        <SkeletonLoader className="w-12 h-12 rounded-lg" />
                        <SkeletonLoader className="w-16 h-6" />
                    </div>
                    <SkeletonLoader className="w-20 h-10" />
                    <SkeletonLoader className="w-32 h-4" />
                </div>
            ))}
        </div>
    );
}

// List skeleton for loading states
export function ListSkeleton({ count = 5 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="glass-light rounded-lg p-5 space-y-3 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-start gap-3">
                        <SkeletonLoader className="w-12 h-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <SkeletonLoader className="w-3/4 h-6" />
                            <SkeletonLoader className="w-full h-4" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <SkeletonLoader className="w-20 h-6 rounded-full" />
                        <SkeletonLoader className="w-24 h-6 rounded-full" />
                        <SkeletonLoader className="w-16 h-6 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
