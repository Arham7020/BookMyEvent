import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuPlus, LuX } from 'react-icons/lu';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { PageLoader, StatusPill, PaymentPill, Notice } from '../components/ui';
import { fmtDate, fmtPrice, methodOf } from '../utils/format';

const EMPTY = { title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' };

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('bookings');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [e, b] = await Promise.all([api.get('/events'), api.get('/bookings/my')]);
            setEvents(e.data);
            setBookings(b.data);
        } catch {
            setError('We couldn’t load the dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') return navigate('/login');
        fetchData();
    }, [user, navigate]);

    const run = async (fn, fallback) => {
        setError('');
        try {
            await fn();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || fallback);
        }
    };

    const createEvent = (e) => {
        e.preventDefault();
        run(async () => {
            await api.post('/events', form);
            setShowForm(false);
            setForm(EMPTY);
        }, 'Couldn’t create the event.');
    };
    const deleteEvent = (id) => window.confirm('Delete this event?') && run(() => api.delete(`/events/${id}`), 'Couldn’t delete the event.');
    const approve = (id, paymentStatus) => run(() => api.put(`/bookings/${id}/confirm`, { paymentStatus }), 'Couldn’t approve the booking.');
    const reject = (id) => window.confirm('Reject this booking?') && run(() => api.delete(`/bookings/${id}`), 'Couldn’t reject the booking.');

    if (!user || loading) return <PageLoader />;

    const revenue = bookings.reduce((s, b) => (b.paymentStatus === 'paid' && b.status === 'confirmed' ? s + b.amount : s), 0);
    const pending = bookings.filter((b) => b.status === 'pending');
    const rank = { pending: 0, confirmed: 1, cancelled: 2 };
    const sorted = [...bookings].sort((a, b) => rank[a.status] - rank[b.status]);
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const stats = [
        ['Revenue collected', fmtPrice(revenue) === 'Free' ? '₹0' : fmtPrice(revenue)],
        ['Waiting for approval', pending.length],
        ['Confirmed bookings', bookings.filter((b) => b.status === 'confirmed').length],
        ['Events', events.length],
    ];

    return (
        <div className="wrap pt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold sm:text-5xl">Admin</h1>
                    <p className="mt-2 text-muted">Approve bookings and manage what’s on.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`}>
                    {showForm ? <><LuX aria-hidden="true" /> Close form</> : <><LuPlus aria-hidden="true" /> New event</>}
                </button>
            </div>

            <dl className="mt-10 grid grid-cols-2 overflow-hidden rounded-2xl bg-surface lg:grid-cols-4">
                {stats.map(([label, value], i) => (
                    <div key={label} className={`p-6 ${i % 2 === 1 ? 'border-l border-line' : ''} ${i > 1 ? 'border-t border-line lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l' : ''}`}>
                        <dd className="font-display text-3xl font-extrabold">{value}</dd>
                        <dt className="mt-1 text-sm text-muted">{label}</dt>
                    </div>
                ))}
            </dl>

            <div className="mt-5"><Notice>{error}</Notice></div>

            {showForm && (
                <form onSubmit={createEvent} className="mt-6 grid gap-5 rounded-2xl bg-surface p-6 sm:p-8 md:grid-cols-2">
                    <h2 className="text-2xl font-bold md:col-span-2">New event</h2>
                    <div><label className="label" htmlFor="t">Title</label><input id="t" required className="input" value={form.title} onChange={set('title')} /></div>
                    <div><label className="label" htmlFor="c">Category</label><input id="c" required className="input" placeholder="Music, Tech, Art" value={form.category} onChange={set('category')} /></div>
                    <div><label className="label" htmlFor="d">Date</label><input id="d" required type="date" className="input" value={form.date} onChange={set('date')} /></div>
                    <div><label className="label" htmlFor="l">Location</label><input id="l" required className="input" value={form.location} onChange={set('location')} /></div>
                    <div><label className="label" htmlFor="s">Total seats</label><input id="s" required type="number" min="1" className="input" value={form.totalSeats} onChange={set('totalSeats')} /></div>
                    <div><label className="label" htmlFor="p">Ticket price in ₹ (0 for free)</label><input id="p" required type="number" min="0" className="input" value={form.ticketPrice} onChange={set('ticketPrice')} /></div>
                    <div className="md:col-span-2"><label className="label" htmlFor="i">Image URL (optional)</label><input id="i" className="input" placeholder="https://" value={form.image} onChange={set('image')} /></div>
                    <div className="md:col-span-2"><label className="label" htmlFor="desc">Description</label><textarea id="desc" required rows={4} className="input" value={form.description} onChange={set('description')} /></div>
                    <div className="md:col-span-2"><button type="submit" className="btn btn-primary">Publish event</button></div>
                </form>
            )}

            <div className="mt-10 flex gap-6 border-b border-line" role="tablist">
                {[['bookings', `Bookings (${bookings.length})`], ['events', `Events (${events.length})`]].map(([k, label]) => (
                    <button
                        key={k}
                        role="tab"
                        aria-selected={tab === k}
                        onClick={() => setTab(k)}
                        className={`-mb-px border-b-2 pb-3 text-base font-semibold transition ${tab === k ? 'border-brand text-fg' : 'border-transparent text-muted hover:text-fg'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'bookings' ? (
                sorted.length === 0 ? (
                    <p className="py-16 text-center text-muted">No bookings yet. They’ll appear here as people book.</p>
                ) : (
                    <div className="mt-5 overflow-x-auto rounded-2xl bg-surface">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead className="border-b border-line text-muted">
                                <tr>
                                    {['Event', 'Customer', 'Payment', 'Status', ''].map((h) => (
                                        <th key={h} scope="col" className="px-5 py-3.5 font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {sorted.map((b) => (
                                    <tr key={b._id} className="align-top">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold">{b.eventId?.title || 'Deleted event'}</div>
                                            {b.eventId && <div className="text-muted">{b.eventId.availableSeats} of {b.eventId.totalSeats} seats left</div>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold">{b.userId?.name}</div>
                                            <div className="text-muted">{b.userId?.email}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold">{fmtPrice(b.amount)}</div>
                                            <div className="text-muted">{methodOf(b)}{b.paymentDetail ? `, ${b.paymentDetail}` : ''}</div>
                                            <div className="mt-1.5"><PaymentPill booking={b} /></div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusPill status={b.status} />
                                            <div className="mt-1.5 text-muted">{fmtDate(b.bookedAt, { day: 'numeric', month: 'short' })}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {b.status === 'pending' && (
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    {b.amount > 0 && <button onClick={() => approve(b._id, 'paid')} className="btn btn-primary btn-sm">Approve, paid</button>}
                                                    <button onClick={() => approve(b._id, 'not_paid')} className="btn btn-ghost btn-sm">{b.amount > 0 ? 'Approve, unpaid' : 'Approve'}</button>
                                                    <button onClick={() => reject(b._id)} className="btn btn-sm text-rose-300 hover:bg-rose-400/15">Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : events.length === 0 ? (
                <p className="py-16 text-center text-muted">No events yet. Use “New event” to publish the first one.</p>
            ) : (
                <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl bg-surface">
                    {events.map((ev) => (
                        <li key={ev._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="font-semibold">{ev.title}</div>
                                <div className="text-sm text-muted">
                                    {fmtDate(ev.date)}, {ev.location}, {ev.availableSeats} of {ev.totalSeats} seats left, {fmtPrice(ev.ticketPrice)}
                                </div>
                            </div>
                            <button onClick={() => deleteEvent(ev._id)} className="btn btn-sm self-start text-rose-300 hover:bg-rose-400/15 sm:self-auto">Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminDashboard;
