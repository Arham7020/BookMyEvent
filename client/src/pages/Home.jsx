import { useState, useEffect } from 'react';
import { LuSearch } from 'react-icons/lu';
import api from '../utils/axios';
import EventCard from '../components/EventCard';
import { PageLoader } from '../components/ui';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const id = setTimeout(async () => {
            try {
                const { data } = await api.get('/events', { params: { search } });
                const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
                setEvents(sorted);
                setFailed(false);
                if (!search) setCategories([...new Set(sorted.map((e) => e.category).filter(Boolean))]);
            } catch {
                setFailed(true);
            } finally {
                setLoading(false);
            }
        }, 350);
        return () => clearTimeout(id);
    }, [search]);

    const shown = category === 'All' ? events : events.filter((e) => e.category === category);
    const nextUp = events.find((e) => new Date(e.date) >= new Date() && e.availableSeats > 0);

    return (
        <>
            <section className="relative isolate overflow-hidden bg-night text-fg">
                <img
                    src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=2400"
                    alt=""
                    className="absolute inset-0 -z-20 h-full w-full object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/80 to-night/30" />
                <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-night to-transparent" />

                <div className="wrap grid min-h-[min(80vh,780px)] items-center gap-12 py-16 lg:grid-cols-[1.3fr_1fr]">
                    <div>
                        <h1 className="text-5xl font-extrabold leading-[0.98] sm:text-6xl xl:text-8xl">
                            Find something worth leaving the house for.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg/80 xl:text-xl">
                            Concerts, talks, workshops and festivals near you. Pick a date, pay your way, and your ticket is waiting in your account.
                        </p>

                        <label className="mt-9 flex max-w-2xl items-center gap-3 rounded-xl border border-line bg-night/70 px-5 py-4 text-fg backdrop-blur focus-within:border-brand-soft focus-within:ring-4 focus-within:ring-brand/40">
                            <LuSearch className="shrink-0 text-xl text-muted" aria-hidden="true" />
                            <span className="sr-only">Search events</span>
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by event name"
                                className="w-full bg-transparent text-lg outline-none placeholder:text-muted/70"
                            />
                        </label>
                        {!loading && !failed && (
                            <p className="mt-4 text-sm text-fg/70">
                                {events.length} {events.length === 1 ? 'event' : 'events'} on sale right now
                            </p>
                        )}
                    </div>

                    {nextUp && !search && (
                        <div className="mx-auto hidden w-full max-w-md lg:block">
                            <p className="mb-3 text-sm font-semibold text-gold">Happening next</p>
                            <div className="ticket-in" style={{ transform: 'rotate(-2.5deg)' }}>
                                <EventCard event={nextUp} />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="wrap pt-14" id="events">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-3xl font-extrabold sm:text-4xl">
                        {search ? `Results for “${search}”` : 'Upcoming events'}
                    </h2>
                    {categories.length > 1 && (
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                            {['All', ...categories].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    aria-pressed={category === c}
                                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                                        category === c
                                            ? 'border-brand bg-brand text-white'
                                            : 'border-line bg-surface text-muted hover:border-fg hover:text-fg'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading ? (
                    <PageLoader label="Loading events" />
                ) : failed ? (
                    <p className="py-20 text-center text-muted">We couldn’t reach the server. Check that the backend is running, then refresh.</p>
                ) : shown.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-xl font-semibold">Nothing matches that yet.</p>
                        <p className="mt-2 text-muted">Try a different name or clear the category filter.</p>
                        {(search || category !== 'All') && (
                            <button className="btn btn-ghost mt-6" onClick={() => { setSearch(''); setCategory('All'); }}>
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
                        {shown.map((event) => (
                            <EventCard key={event._id} event={event} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
};

export default Home;
