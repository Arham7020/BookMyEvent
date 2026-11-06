export default function Logo({ className = '' }) {
    return (
        <span className={`inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight ${className}`}>
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="currentColor" opacity=".16" />
                <path
                    d="M7 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.2a2.8 2.8 0 0 0 0 5.6V21a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2.2a2.8 2.8 0 0 0 0-5.6z"
                    fill="#FFB320"
                />
            </svg>
            BookMyEvent
        </span>
    );
}
