import { useRef } from 'react';

export const Spinner = ({ className = '' }) => (
    <span
        aria-hidden="true"
        className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
);

export const PageLoader = ({ label = 'Loading' }) => (
    <div className="flex items-center justify-center gap-3 py-32 text-muted" role="status">
        <Spinner className="h-5 w-5" /> {label}
    </div>
);

export const Notice = ({ tone = 'bad', children }) =>
    children ? (
        <div
            role={tone === 'bad' ? 'alert' : 'status'}
            className={`rounded-lg px-4 py-3 text-sm font-medium ${tone === 'bad' ? 'pill-bad' : 'pill-ok'}`}
            style={{ display: 'block' }}
        >
            {children}
        </div>
    ) : null;

const BOOKING_TONE = { confirmed: 'pill-ok', pending: 'pill-warn', cancelled: 'pill-bad' };
const BOOKING_TEXT = { confirmed: 'Confirmed', pending: 'Awaiting approval', cancelled: 'Cancelled' };

export const StatusPill = ({ status }) => (
    <span className={`pill ${BOOKING_TONE[status] || 'pill-neutral'}`}>{BOOKING_TEXT[status] || status}</span>
);

export const PaymentPill = ({ booking }) => {
    if (!booking.amount || booking.status === 'cancelled') return null;
    return booking.paymentStatus === 'paid' ? (
        <span className="pill pill-ok">Paid</span>
    ) : (
        <span className="pill pill-neutral">Unpaid</span>
    );
};

export function OtpInput({ value, onChange, length = 6 }) {
    const refs = useRef([]);
    const focus = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

    const handleChange = (i, e) => {
        const digits = e.target.value.replace(/\D/g, '');
        if (!digits) return;
        const next = (value.slice(0, i) + digits + value.slice(i + 1)).slice(0, length);
        onChange(next);
        focus(i + digits.length);
    };

    const handleKey = (i, e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (value[i]) onChange(value.slice(0, i) + value.slice(i + 1));
            else if (i > 0) {
                onChange(value.slice(0, i - 1) + value.slice(i));
                focus(i - 1);
            }
        } else if (e.key === 'ArrowLeft') focus(i - 1);
        else if (e.key === 'ArrowRight') focus(i + 1);
    };

    const handlePaste = (e) => {
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (!digits) return;
        e.preventDefault();
        onChange(digits);
        focus(digits.length);
    };

    return (
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    value={value[i] || ''}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKey(i, e)}
                    onFocus={(e) => e.target.select()}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${i + 1} of ${length}`}
                    className="input h-14 min-w-0 flex-1 px-0 text-center font-display text-2xl font-bold"
                />
            ))}
        </div>
    );
}
