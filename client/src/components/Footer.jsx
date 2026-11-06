import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer className="mt-24 border-t border-line">
            <div className="wrap flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
                <div>
                    <Logo className="text-fg" />
                    <p className="mt-2 max-w-xs text-sm text-muted">Tickets for concerts, talks, workshops and everything in between.</p>
                </div>
                <div className="flex gap-6 text-sm font-semibold text-muted">
                    <Link to="/" className="hover:text-fg">Events</Link>
                    <Link to="/dashboard" className="hover:text-fg">My tickets</Link>
                    <Link to="/login" className="hover:text-fg">Log in</Link>
                </div>
            </div>
            <div className="wrap pb-8 text-xs text-muted">© {new Date().getFullYear()} Eventora</div>
        </footer>
    );
}
