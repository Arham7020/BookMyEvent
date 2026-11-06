import { Link } from 'react-router-dom';
import { LuMapPin, LuTicket } from 'react-icons/lu';
import { dayOf, monthOf, fmtPrice } from '../utils/format';

export default function EventCard({ event }) {
    const soldOut = event.availableSeats <= 0;
    const low = !soldOut && event.availableSeats <= 10;

    return (
        <Link
            to={`/events/${event._id}`}
            className="ticket group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface text-fg"
        >
            <div className="relative aspect-[16/10] shrink-0 bg-raise">
                {event.image ? (
                    <img src={event.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center bg-brand p-4 text-center font-display text-3xl font-extrabold text-white/90">
                        {event.category}
                    </div>
                )}
                <div className="absolute left-3 top-3 rounded-lg bg-night/90 px-3 py-1.5 text-center leading-none text-fg backdrop-blur">
                    <div className="font-display text-xl font-extrabold">{dayOf(event.date)}</div>
                    <div className="mt-0.5 text-xs font-semibold text-muted">{monthOf(event.date)}</div>
                </div>
            </div>

            <div className="flex-1 px-5 pb-5 pt-4">
                <p className="mb-1 text-sm font-semibold text-brand-soft">{event.category}</p>
                <h3 className="line-clamp-2 text-xl font-bold leading-snug text-fg group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                    {event.title}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                    <LuMapPin className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{event.location}</span>
                </p>
            </div>

            <div className="perforation" />
            <div className="flex h-[88px] shrink-0 items-center justify-between px-5">
                <div>
                    <div className="font-display text-2xl font-extrabold leading-none text-gold">{fmtPrice(event.ticketPrice)}</div>
                    <div className={`mt-1.5 text-sm ${soldOut || low ? 'font-semibold text-amber-300' : 'text-muted'}`}>
                        {soldOut ? 'Sold out' : low ? `Only ${event.availableSeats} left` : `${event.availableSeats} seats left`}
                    </div>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-soft">
                    <LuTicket aria-hidden="true" /> {soldOut ? 'Details' : 'Get ticket'}
                </span>
            </div>
        </Link>
    );
}
