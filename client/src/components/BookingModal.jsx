import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuBanknote, LuSmartphone, LuCreditCard, LuX, LuCheck, LuArrowLeft } from 'react-icons/lu';
import api from '../utils/axios';
import { OtpInput, Spinner, Notice } from './ui';
import { fmtPrice, fmtDate, METHOD_LABEL } from '../utils/format';

const METHODS = [
    { id: 'upi', label: 'UPI', hint: 'Pay from any UPI app with your UPI ID', icon: LuSmartphone },
    { id: 'card', label: 'Credit or debit card', hint: 'Visa, Mastercard, RuPay', icon: LuCreditCard },
    { id: 'cash', label: 'Cash at the venue', hint: 'Pay at the entrance once your booking is approved', icon: LuBanknote },
];

const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function validate(method, upi, card) {
    if (method === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi.trim())) return 'Enter a valid UPI ID, like name@okbank.';
    if (method === 'card') {
        if (card.number.replace(/\s/g, '').length < 15) return 'Enter the full card number.';
        if (!card.name.trim()) return 'Enter the name on the card.';
        const m = card.expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!m || +m[1] < 1 || +m[1] > 12) return 'Enter the expiry as MM/YY.';
        const end = new Date(2000 + +m[2], +m[1], 0, 23, 59);
        if (end < new Date()) return 'This card has expired.';
        if (!/^\d{3,4}$/.test(card.cvv)) return 'Enter the 3 or 4 digit CVV.';
    }
    return '';
}

// Only a masked label is ever sent to the server. Full card numbers and CVV never leave this component.
function maskedDetail(method, upi, card) {
    if (method === 'upi') {
        const [name, handle] = upi.trim().split('@');
        return `${name.slice(0, 2)}***@${handle}`;
    }
    if (method === 'card') return `Card ending ${card.number.replace(/\s/g, '').slice(-4)}`;
    return '';
}

export default function BookingModal({ event, onClose, onBooked }) {
    const free = !event.ticketPrice;
    const [step, setStep] = useState('pay');
    const [method, setMethod] = useState('upi');
    const [upi, setUpi] = useState('');
    const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && step !== 'done' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose, step]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const sendOtp = async () => {
        setError('');
        if (!free) {
            const problem = validate(method, upi, card);
            if (problem) return setError(problem);
        }
        setLoading(true);
        try {
            await api.post('/bookings/send-otp');
            setStep('otp');
            setCooldown(30);
        } catch (err) {
            setError(err.response?.data?.message || 'We couldn’t send the code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const confirm = async () => {
        setError('');
        setLoading(true);
        try {
            await api.post('/bookings', {
                eventId: event._id,
                otp,
                paymentMethod: free ? 'none' : method,
                paymentDetail: free ? '' : maskedDetail(method, upi, card),
            });
            setStep('done');
            onBooked?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const setC = (k) => (e) => {
        const v = e.target.value;
        setCard((c) => ({ ...c, [k]: k === 'number' ? formatCard(v) : k === 'expiry' ? formatExpiry(v) : k === 'cvv' ? v.replace(/\D/g, '').slice(0, 4) : v }));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
            onMouseDown={(e) => e.target === e.currentTarget && step !== 'done' && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-title"
                className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-night sm:max-w-lg sm:rounded-2xl"
            >
                <div className="flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-5">
                    <div>
                        <h2 id="booking-title" className="text-xl font-extrabold leading-tight">{event.title}</h2>
                        <p className="mt-1 text-sm text-muted">
                            {fmtDate(event.date)} · {fmtPrice(event.ticketPrice)} · 1 ticket
                        </p>
                    </div>
                    {step !== 'done' && (
                        <button onClick={onClose} aria-label="Close" className="-mr-2 rounded-md p-2 text-muted hover:bg-raise hover:text-fg">
                            <LuX className="text-xl" />
                        </button>
                    )}
                </div>

                <div className="space-y-5 px-6 py-6">
                    {step === 'pay' && (
                        <>
                            {free ? (
                                <p className="rounded-lg bg-surface p-4 text-muted">This event is free, so there’s nothing to pay. We’ll verify it’s you with a one-time code.</p>
                            ) : (
                                <fieldset>
                                    <legend className="label">How would you like to pay?</legend>
                                    <div className="space-y-2.5">
                                        {METHODS.map(({ id, label, hint, icon: Icon }) => (
                                            <label
                                                key={id}
                                                className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 bg-surface p-4 transition ${method === id ? 'border-brand' : 'border-line hover:border-muted'}`}
                                            >
                                                <input type="radio" name="method" value={id} checked={method === id} onChange={() => { setMethod(id); setError(''); }} className="sr-only" />
                                                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${method === id ? 'bg-brand text-white' : 'bg-raise text-fg'}`}>
                                                    <Icon aria-hidden="true" />
                                                </span>
                                                <span>
                                                    <span className="block font-semibold">{label}</span>
                                                    <span className="block text-sm text-muted">{hint}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    {method === 'upi' && (
                                        <div className="mt-4">
                                            <label className="label" htmlFor="upi">UPI ID</label>
                                            <input id="upi" className="input" placeholder="name@okbank" value={upi} onChange={(e) => setUpi(e.target.value)} autoComplete="off" />
                                        </div>
                                    )}
                                    {method === 'card' && (
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="label" htmlFor="cc-number">Card number</label>
                                                <input id="cc-number" className="input" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={card.number} onChange={setC('number')} />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="label" htmlFor="cc-name">Name on card</label>
                                                <input id="cc-name" className="input" autoComplete="cc-name" value={card.name} onChange={setC('name')} />
                                            </div>
                                            <div>
                                                <label className="label" htmlFor="cc-exp">Expiry</label>
                                                <input id="cc-exp" className="input" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={setC('expiry')} />
                                            </div>
                                            <div>
                                                <label className="label" htmlFor="cc-cvv">CVV</label>
                                                <input id="cc-cvv" type="password" className="input" inputMode="numeric" autoComplete="cc-csc" value={card.cvv} onChange={setC('cvv')} />
                                            </div>
                                        </div>
                                    )}
                                    {method === 'cash' && (
                                        <p className="mt-4 text-sm text-muted">Bring {fmtPrice(event.ticketPrice)} in cash. Your ticket is marked unpaid until the organiser receives it.</p>
                                    )}
                                </fieldset>
                            )}
                            <Notice>{error}</Notice>
                            <button onClick={sendOtp} disabled={loading} className="btn btn-primary w-full">
                                {loading && <Spinner />} Continue
                            </button>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <button onClick={() => { setStep('pay'); setOtp(''); setError(''); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
                                <LuArrowLeft aria-hidden="true" /> Change payment method
                            </button>
                            <div>
                                <h3 className="text-lg font-bold">Enter the code we emailed you</h3>
                                <p className="mt-1 text-sm text-muted">It’s a 6-digit code and it expires in 5 minutes.</p>
                            </div>
                            <OtpInput value={otp} onChange={setOtp} />
                            <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 text-sm">
                                <span className="text-muted">{free ? 'Free ticket' : `${METHOD_LABEL[method]}`}</span>
                                <span className="font-display text-lg font-extrabold">{fmtPrice(event.ticketPrice)}</span>
                            </div>
                            <Notice>{error}</Notice>
                            <button onClick={confirm} disabled={loading || otp.length < 6} className="btn btn-primary w-full">
                                {loading && <Spinner />} {free ? 'Confirm booking' : method === 'cash' ? 'Confirm booking' : `Confirm and pay ${fmtPrice(event.ticketPrice)}`}
                            </button>
                            <button onClick={sendOtp} disabled={loading || cooldown > 0} className="w-full text-sm font-semibold text-brand-soft disabled:text-muted">
                                {cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
                            </button>
                        </>
                    )}

                    {step === 'done' && (
                        <div className="py-2 text-center">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#dcf2e6] text-2xl text-[#14663f]">
                                <LuCheck aria-hidden="true" />
                            </span>
                            <h3 className="mt-4 text-2xl font-extrabold">Booking requested</h3>
                            <p className="mx-auto mt-2 max-w-sm text-muted">
                                The organiser will review it shortly. You’ll get an email as soon as it’s confirmed.
                                {!free && method === 'cash' && ' Remember to bring cash for the entrance.'}
                            </p>
                            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                                <Link to="/dashboard" className="btn btn-primary">View my tickets</Link>
                                <button onClick={onClose} className="btn btn-ghost">Back to event</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
