import sorteazoLogo from "../assets/LogoSorteazo-W.svg";

export function TopNavBar() {
    return (
        <header className="w-full bg-[var(--color-primary)] py-4 px-8 shadow-md">
            <div className="container mx-auto flex items-center">
                <img
                    src={sorteazoLogo}
                    alt="Sorteazo logo"
                    className="h-15"
                />
            </div>
        </header>
    );
}
