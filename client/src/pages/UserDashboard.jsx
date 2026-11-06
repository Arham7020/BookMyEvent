import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuMapPin, LuTicket } from 'react-icons/lu';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { PageLoader, StatusPill, PaymentPill, Notice } from '../components/ui';
import { dayOf, monthOf, fmtPrice, methodOf } from '../utils/format';

const FILTERS = [
    ['all', 'All'],
    ['confirmed', 'Confirmed'],
    ['pending', 'Awaiting approval'],
    ['cancelled', 'Cancelled'],
];

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch {
            setError('We couldn’t load your bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return navigate('/login');
        load();
    }, [user, navigate]);

    const cancelBooking = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            await api.delete(`/bookings/${id}`);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Couldn’t cancel the booking.');
        }
    };

    if (!user || loading) return <PageLoader />;

    const count = (s) => bookings.filter((b) => b.status === s).length;
    const shown = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

    return (
        <div className="wrap pt-12">
            <h1 className="text-4xl font-extrabold sm:text-5xl">Hi {user.name.split(' ')[0]}.</h1>
            <p className="mt-3 text-lg text-muted">
                {bookings.length === 0
                    ? 'You haven’t booked anything yet.'
                    : `${count('confirmed')} confirmed, ${count('pending')} waiting for approval.`}
            </p>

            <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter bookings">
                {FILTERS.map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        aria-pressed={filter === key}
                        className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${filter === key ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted hover:border-fg hover:text-fg'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="mt-5"><Notice>{error}</Notice></div>

            {shown.length === 0 ? (
                <div className="mt-10 rounded-2xl border-2 border-dashed border-line py-16 text-center">
                    <LuTicket className="mx-auto mb-3 text-3xl text-muted" aria-hidden="true" />
                    <p className="text-lg font-semibold">{bookings.length ? 'No bookings in this view.' : 'No tickets yet.'}</p>
                    <p className="mb-6 mt-1 text-muted">Find an event and your ticket will show up here.</p>
                    <Link to="/" className="btn btn-primary">Browse events</Link>
                </div>
            ) : (
                <ul className="mt-5 grid gap-4 xl:grid-cols-2">
                    {shown.map((b) => {
                        const ev = b.eventId;
                        const cancelled = b.status === 'cancelled';
                        return (
                            <li key={b._id} className={`flex overflow-hidden rounded-2xl bg-surface ${cancelled ? 'opacity-70' : ''}`}>
                                <div className={`flex w-20 shrink-0 flex-col items-center justify-center text-white sm:w-24 ${cancelled ? 'bg-raise' : 'bg-brand'}`}>
                                    {ev ? (
                                        <>
                                            <span className="font-display text-3xl font-extrabold leading-none">{dayOf(ev.date)}</span>
                                            <span className="mt-1 text-sm font-semibold text-white/80">{monthOf(ev.date)}</span>
                                        </>
                                    ) : <LuTicket aria-hidden="true" />}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-3 border-l-2 border-dashed border-line p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-bold">{ev ? ev.title : 'Event removed'}</h2>
                                        {ev && (
                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                                                <LuMapPin className="shrink-0" aria-hidden="true" /> <span className="truncate">{ev.location}</span>
                                            </p>
                                        )}
                                        <p className="mt-2 text-sm text-muted">
                                            {fmtPrice(b.amount)}{b.amount > 0 && <>, {b.paymentStatus === 'paid' ? 'paid with' : 'to pay with'} {methodOf(b).toLowerCase()}{b.paymentDetail ? ` (${b.paymentDetail})` : ''}</>}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                                        <div className="flex gap-1.5"><StatusPill status={b.status} /><PaymentPill booking={b} /></div>
                                        {!cancelled && (
                                            <div className="flex gap-3 text-sm font-semibold">
                                                {ev && <Link to={`/events/${ev._id}`} className="text-brand-soft hover:underline">View event</Link>}
                                                <button onClick={() => cancelBooking(b._id)} className="text-rose-300 hover:underline">Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default UserDashboard;
