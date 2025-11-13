export function InputDate({ label, placeholder = "dd/mm/aaaa", value, onChange }) {
    return (
        <div className="flex flex-col mb-5">
            <label className="flex items-center gap-2 mb-2 text-[var(--color-primary)] font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {label}
            </label>
            <div className="relative">
                <input
                    type="date"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full border border-[var(--color-light-gray)] rounded-xl px-4 py-2 text-[var(--color-gray-text)] placeholder-[var(--color-gray-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                />
            </div>
        </div>
    );
}
