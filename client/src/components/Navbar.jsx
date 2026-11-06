import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from './Logo';

const linkCls = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-raise text-fg' : 'text-muted hover:text-fg'}`;

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-night/95 backdrop-blur">
            <div className="wrap flex h-16 items-center justify-between gap-4">
                <Link to="/" className="text-fg" aria-label="BookMyEvent home">
                    <Logo />
                </Link>

                <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
                    <NavLink to="/" end className={linkCls}>Events</NavLink>
                    {user ? (
                        <>
                            <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className={linkCls}>
                                {user.role === 'admin' ? 'Admin' : 'My tickets'}
                            </NavLink>
                            <span
                                className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white sm:flex"
                                title={user.name}
                                aria-hidden="true"
                            >
                                {user.name?.charAt(0).toUpperCase()}
                            </span>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm">Log out</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={linkCls}>Log in</NavLink>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
