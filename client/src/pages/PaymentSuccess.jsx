import { Link } from 'react-router-dom';
import { LuCheck } from 'react-icons/lu';

const PaymentSuccess = () => (
    <div className="wrap flex min-h-[60vh] items-center justify-center py-16">
        <div className="max-w-md text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#dcf2e6] text-2xl text-[#14663f]">
                <LuCheck aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-4xl font-extrabold">You’re booked in.</h1>
            <p className="mt-3 text-muted">Your payment went through. We’ve emailed the details, and the ticket is in your account.</p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link to="/dashboard" className="btn btn-primary">View my tickets</Link>
                <Link to="/" className="btn btn-ghost">Browse more events</Link>
            </div>
        </div>
    </div>
);

export default PaymentSuccess;
