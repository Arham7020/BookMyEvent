import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Notice, OtpInput, Spinner } from '../components/ui';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                await register(name, email, password);
                setShowOTP(true);
            } else {
                await verifyOTP(email, otp);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={showOTP ? 'Check your inbox' : 'Create your account'}
            subtitle={showOTP ? `We sent a 6-digit code to ${email}. Enter it to finish signing up.` : 'It takes a minute and you can book right away.'}
            footer={!showOTP && <>Already have an account? <Link to="/login" className="font-semibold text-brand-soft hover:underline">Log in</Link></>}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <Notice>{error}</Notice>
                {showOTP ? (
                    <OtpInput value={otp} onChange={setOtp} />
                ) : (
                    <>
                        <div>
                            <label className="label" htmlFor="name">Full name</label>
                            <input id="name" required autoComplete="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="email">Email</label>
                            <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="password">Password</label>
                            <input id="password" type="password" required autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </>
                )}
                <button type="submit" disabled={loading || (showOTP && otp.length < 6)} className="btn btn-primary w-full">
                    {loading && <Spinner />} {showOTP ? 'Verify and continue' : 'Create account'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Register;
