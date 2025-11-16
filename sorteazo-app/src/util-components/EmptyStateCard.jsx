export function EmptyStateCard({ message, icon }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--color-light-gray)] rounded-xl border-2 border-dashed border-[var(--color-gray-text)] min-h-[400px]">
            {icon && (
                <div className="mb-4 text-[var(--color-gray-text)]">
                    {icon}
                </div>
            )}
            <p className="text-[var(--color-gray-text)] font-afacad text-xl text-center">
                {message}
            </p>
        </div>
    );
}
