export function StatsCard({ icon: Icon, label, value, color = "var(--color-primary)" }) {
    return (
        <div className="bg-white border border-[var(--color-light-gray)] rounded-xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
            <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${color}1A` }} // 1A = 10% opacity in hex
            >
                {Icon && (
                    <Icon 
                        style={{ color: color }} 
                        size={32} 
                    />
                )}
            </div>
            <div className="flex-1">
                <p className="font-afacad text-[var(--color-gray-text)] text-sm">
                    {label}
                </p>
                <p className="font-afacad text-3xl font-bold text-[var(--color-dark-text)]">
                    {value}
                </p>
            </div>
        </div>
    );
}
