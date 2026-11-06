import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.1fr_1fr]">
            <div className="relative isolate hidden flex-col justify-between overflow-hidden p-12 text-fg lg:flex">
                <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1600" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
                <div className="absolute inset-0 -z-10 bg-night/75" />
                <Link to="/" aria-label="Eventora home"><Logo /></Link>
                <div>
                    <p className="max-w-lg font-display text-5xl font-extrabold leading-[1.02] xl:text-6xl">
                        Your next night out is a few taps away.
                    </p>
                    <p className="mt-5 max-w-sm text-lg text-fg/80">Book with UPI, card or cash, and keep every ticket in one place.</p>
                </div>
                <p className="text-sm text-fg/60">Accounts are verified by email so only you can book in your name.</p>
            </div>

            <div className="flex items-center justify-center px-5 py-12 sm:px-8">
                <div className="w-full max-w-sm">
                    <h1 className="text-3xl font-extrabold">{title}</h1>
                    <p className="mb-8 mt-2 text-muted">{subtitle}</p>
                    {children}
                    <div className="mt-8 text-center text-sm text-muted">{footer}</div>
                </div>
            </div>
        </div>
    );
}
