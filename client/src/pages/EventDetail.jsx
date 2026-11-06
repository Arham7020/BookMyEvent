import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LuCalendar, LuMapPin, LuArrowLeft, LuUsers } from 'react-icons/lu';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { PageLoader } from '../components/ui';
import { fmtDate, fmtPrice } from '../utils/format';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [requested, setRequested] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch {
                setError('We couldn’t load this event. It may have been removed.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <PageLoader />;
    if (error || !event)
        return (
            <div className="wrap py-28 text-center">
                <p className="mb-6 text-xl font-semibold">{error || 'Event not found.'}</p>
                <Link to="/" className="btn btn-primary">Browse events</Link>
            </div>
        );

    const soldOut = event.availableSeats <= 0;
    const pct = Math.max(0, Math.min(100, (event.availableSeats / event.totalSeats) * 100));
    const past = new Date(event.date) < new Date(new Date().toDateString());

    const onBook = () => (user ? setOpen(true) : navigate('/login'));

    return (
        <div className="wrap pt-8">
            <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
                <LuArrowLeft aria-hidden="true" /> All events
            </Link>

            <div className="grid items-start gap-10 lg:grid-cols-[1fr_420px]">
                <div>
                    <div className="aspect-[2/1] overflow-hidden rounded-2xl bg-raise">
                        {event.image ? (
                            <img src={event.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-brand font-display text-5xl font-extrabold text-white/90">{event.category}</div>
                        )}
                    </div>

                    <p className="mt-8 text-sm font-semibold text-brand-soft">{event.category}</p>
                    <h1 className="mt-1 text-4xl font-extrabold leading-tight sm:text-5xl">{event.title}</h1>

                    <dl className="mt-6 flex flex-col gap-3 text-muted sm:flex-row sm:gap-8">
                        <div className="flex items-center gap-2.5">
                            <LuCalendar className="text-lg text-fg" aria-hidden="true" />
                            <dt className="sr-only">Date</dt>
                            <dd>{fmtDate(event.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</dd>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <LuMapPin className="text-lg text-fg" aria-hidden="true" />
                            <dt className="sr-only">Location</dt>
                            <dd>{event.location}</dd>
                        </div>
                    </dl>

                    <h2 className="mb-3 mt-10 text-2xl font-bold">About this event</h2>
                    <p className="max-w-[68ch] whitespace-pre-line text-lg leading-8 text-fg/85">{event.description}</p>
                </div>

                <aside className="lg:sticky lg:top-24">
                    <div className="ticket relative rounded-2xl bg-surface" style={{ '--stub': '104px' }}>
                        <div className="p-6 pb-7">
                            <p className="text-sm text-muted">Ticket price</p>
                            <p className="font-display text-5xl font-extrabold leading-none">{fmtPrice(event.ticketPrice)}</p>

                            <div className="mt-7">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-muted"><LuUsers aria-hidden="true" /> Availability</span>
                                    <span className={`font-semibold ${soldOut || event.availableSeats <= 10 ? 'text-amber-300' : ''}`}>
                                        {soldOut ? 'Sold out' : `${event.availableSeats} of ${event.totalSeats} left`}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-raise" role="presentation">
                                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="perforation" />
                        <div className="flex h-[104px] items-center px-6">
                            <button
                                onClick={onBook}
                                disabled={soldOut || past || requested}
                                className="btn btn-primary w-full py-3.5 text-lg"
                            >
                                {past ? 'Event has ended' : soldOut ? 'Sold out' : requested ? 'Request sent' : user ? 'Book a ticket' : 'Log in to book'}
                            </button>
                        </div>
                    </div>
                    {!user && !soldOut && !past && (
                        <p className="mt-3 text-center text-sm text-muted">
                            New here? <Link to="/register" className="font-semibold text-brand-soft hover:underline">Create an account</Link>
                        </p>
                    )}
                </aside>
            </div>

            {open && (
                <BookingModal
                    event={event}
                    onClose={() => setOpen(false)}
                    onBooked={() => setRequested(true)}
                />
            )}
        </div>
    );
};

export default EventDetail;
