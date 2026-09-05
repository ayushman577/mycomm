import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { getApiError, resendOTP, verifyEmail } from '../services/authService';

function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || sessionStorage.getItem('verificationEmail') || '';
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const inputRef = useRef(null);

    useEffect(() => inputRef.current?.focus(), []);

    useEffect(() => {
        if (timer <= 0) return undefined;

        const interval = setInterval(() => {
            setTimer((previousTimer) => previousTimer - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const submit = async (event) => {
        event.preventDefault();

        if (!email) { setError('Please return to registration and enter your email first.'); return; }
        if (otp.length !== 6) { setError('Please enter all 6 digits from the email.'); return; }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await verifyEmail({ email, otp });
            navigate('/login', { state: { message: 'Your email has been verified. You can now log in.' } });
        }
        catch (requestError) {
            setError(getApiError(requestError, 'We could not verify that code. Please check it and try again.'));
        }
        finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        if (!email || timer > 0 || resendLoading) return;

        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            await resendOTP({ email });
            setOtp('');
            setTimer(30);
            setSuccess('A new verification code has been sent to your email.');
            inputRef.current?.focus();
        } catch (requestError) {
            setError(getApiError(requestError, 'Unable to send a new verification code. Please try again.'));
        } finally {
            setResendLoading(false);
        }
    };

    return <AuthLayout eyebrow="Email Verification" title="Verify your email" description="Enter the 6-digit verification code we sent to your email." alert={error} success={success} footer={<>Wrong email? <Link to="/register">Return to registration</Link></>}>
        <form onSubmit={submit} noValidate>
            <p className="email-chip">{email || 'No email selected'}</p>
            <label className="otp-label" htmlFor="otp">Verification code</label>
            <input ref={inputRef} className="otp-input" id="otp" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" aria-label="6-digit verification code" />
            <Button type="submit" loading={loading}>Verify Email</Button>
            <div className="resend-section" aria-live="polite">
                <p>Didn't receive the code?</p>
                <button className="resend-button" type="button" onClick={resend} disabled={!email || timer > 0 || resendLoading}>
                    {resendLoading ? 'Sending...' : timer > 0 ? <>Resend code in <strong>{timer}s</strong></> : 'Resend Code'}
                </button>
            </div>
        </form>
    </AuthLayout>;
}

export default VerifyEmail;