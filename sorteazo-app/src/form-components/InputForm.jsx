export function InputForm({ type, placeholder, name, value, onChange }) {
    return (
        <input
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className="w-full border border-[var(--color-light-gray)] rounded-xl px-4 py-2 text-[var(--color-dark-text)] placeholder-[var(--color-gray-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
        />
    );
}