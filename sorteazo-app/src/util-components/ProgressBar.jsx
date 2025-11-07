export function ProgressBar({ currentStep, totalSteps, stepLabel }) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="flex flex-col">
            <p className="text-left text-[var(--color-gray-text)] mb-3 font-afacad text-sm">
                {stepLabel}
            </p>
            <div className="flex items-center justify-start gap-2">
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div
                            key={stepNumber}
                            className={`h-2 rounded-full transition-all duration-300 ${stepNumber === 1 ? 'w-16' : 'w-12'
                                } ${isActive
                                    ? 'bg-[var(--color-primary)]'
                                    : isCompleted
                                        ? 'bg-[var(--color-primary)]'
                                        : 'bg-[var(--color-light-gray)]'
                                }`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
