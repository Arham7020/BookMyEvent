import { Link } from 'react-router-dom';
import { LuX } from 'react-icons/lu';

const PaymentFailed = () => (
    <div className="wrap flex min-h-[60vh] items-center justify-center py-16">
        <div className="max-w-md text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbe0e0] text-2xl text-[#9e2626]">
                <LuX aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-4xl font-extrabold">Payment didn’t go through.</h1>
            <p className="mt-3 text-muted">You haven’t been charged. Check your details and try again, or choose a different payment method.</p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link to="/" className="btn btn-primary">Back to events</Link>
                <Link to="/dashboard" className="btn btn-ghost">My tickets</Link>
            </div>
        </div>
    </div>
);

export default PaymentFailed;
