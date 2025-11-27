export function InputForm({
    type = "text",
    placeholder,
    name,
    value,
    onChange,
    required,
    error,
    className = "",
    ...props
}) {
    const baseClasses = "w-full border rounded-xl px-4 py-2 text-[var(--color-dark-text)] placeholder-[var(--color-gray-text)] focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200";
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-[var(--color-light-gray)] focus:ring-[var(--color-primary)]";

    return (
        <>
            <input
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                required={required}
                aria-invalid={Boolean(error)}
                className={`${baseClasses} ${errorClasses} ${className}`.trim()}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600 font-afacad">{error}</p>
            )}
        </>
    );
}