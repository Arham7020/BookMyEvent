import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Notice, OtpInput, Spinner } from '../components/ui';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = showOTP ? await verifyOTP(email, otp) : await login(email, password);
            navigate(data.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            if (err.needsVerification) {
                setShowOTP(true);
                setInfo('Your account isn’t verified yet. We’ve emailed you a new code.');
            } else {
                setError(err.message || String(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={showOTP ? 'Verify your email' : 'Welcome back'}
            subtitle={showOTP ? `Enter the 6-digit code sent to ${email}.` : 'Log in to see your tickets and book events.'}
            footer={<>New to BookMyEvent? <Link to="/register" className="font-semibold text-brand-soft hover:underline">Create an account</Link></>}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <Notice tone="ok">{info}</Notice>
                <Notice>{error}</Notice>
                {showOTP ? (
                    <OtpInput value={otp} onChange={setOtp} />
                ) : (
                    <>
                        <div>
                            <label className="label" htmlFor="email">Email</label>
                            <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="password">Password</label>
                            <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </>
                )}
                <button type="submit" disabled={loading || (showOTP && otp.length < 6)} className="btn btn-primary w-full">
                    {loading && <Spinner />} {showOTP ? 'Verify and log in' : 'Log in'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Login;
