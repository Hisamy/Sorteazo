
export function Hero({ text }) {
    return (
        <div className="flex flex-col gap-40 font-open-sans pt-20 pl-15 pr-15 bg-[var(--color-primary)] text-[var(--color-light-text)] h-full">
            <div className="flex flex-col align-start">
                <h1 className="text-3xl font-bold">{text}</h1>
                <p className="text-sm mt-1">please enter your details</p>
            </div>
            <div className="flex justify-start ">
                <img
                    className="max-h-auto w-9/10"
                    src="./src/assets/images/LotteryBalls.png"
                    alt="Lottery balls"
                />
            </div>

        </div>
    );
}