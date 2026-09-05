import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import { getApiError, resendOTP, resetPassword } from '../services/authService';

function ResetPassword() {
    const location = useLocation();
    const [form, setForm] = useState({ 
        email: location.state?.email || '', 
        otp: '', 
        newPassword: '', 
        confirmPassword: '' 
    });
    const [error, setError] = useState(''); 
    const [success, setSuccess] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const [resendLoading, setResendLoading] = useState(false); 
    const [timer, setTimer] = useState(30); 
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (timer <= 0) return undefined;
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const update = (event) => setForm({ ...form, [event.target.id]: event.target.value });
    
    const submit = async (event) => {
        event.preventDefault(); 
        setError(''); 
        setSuccess('');
        
        if (!form.email || form.otp.length !== 6 || form.newPassword.length < 6 || form.newPassword !== form.confirmPassword) { 
            setError('Please enter your email, 6-digit verification code, and a valid password.'); 
            return; 
        }
        
        setLoading(true);
        try { 
            await resetPassword({ email: form.email, otp: form.otp, newPassword: form.newPassword }); 
            setDone(true); 
        } catch (requestError) { 
            setError(getApiError(requestError, 'We could not reset your password. Please try again.')); 
        } finally { 
            setLoading(false); 
        }
    };
    
    const resend = async () => {
        if (!form.email || timer > 0 || resendLoading) return;
        setResendLoading(true); 
        setError(''); 
        setSuccess('');
        try {
            await resendOTP({ email: form.email });
            setForm({ ...form, otp: '' });
            setTimer(30);
            setSuccess('A new verification code has been sent to your email.');
        } catch (requestError) {
            setError(getApiError(requestError, 'Unable to send a new code. Please try again.'));
        } finally {
            setResendLoading(false);
        }
    };

    if (done) {
        return (
            <AuthLayout 
                eyebrow="Password Updated" 
                title="Password Reset Complete" 
                description="Your password has been updated successfully. You can now sign in with your new password."
            >
                <Link className="button button-primary" style={{ width: '100%' }} to="/login">
                    Back to Sign In
                </Link>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout 
            eyebrow="Account Recovery" 
            title="Create a New Password" 
            description="Enter the verification code sent to your email and choose a new password." 
            alert={error} 
            success={success} 
            footer={<>Need to use a different email? <Link to="/forgot-password">Start over</Link></>}
        >
            <form onSubmit={submit} noValidate>
                <Input 
                    id="email" 
                    label="Email address" 
                    type="email" 
                    value={form.email} 
                    onChange={update} 
                    placeholder="name@yourcompany.com" 
                    autoComplete="email" 
                />
                
                <div className="field">
                    <label htmlFor="otp">Verification Code</label>
                    <div className="input-wrap">
                        <input 
                            id="otp" 
                            className="otp-input"
                            value={form.otp} 
                            onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, '').slice(0, 6) })} 
                            inputMode="numeric" 
                            autoComplete="one-time-code" 
                            placeholder="000000" 
                        />
                    </div>
                </div>

                <div className="resend-section" aria-live="polite">
                    <p>Didn't receive the code?</p>
                    <button className="resend-button" type="button" onClick={resend} disabled={!form.email || timer > 0 || resendLoading}>
                        {resendLoading ? 'Sending...' : timer > 0 ? <>Request a new code in <strong>{timer}s</strong></> : 'Send New Code'}
                    </button>
                </div>

                <Input 
                    id="newPassword" 
                    label="New Password" 
                    type="password" 
                    value={form.newPassword} 
                    onChange={update} 
                    placeholder="Minimum 6 characters" 
                    autoComplete="new-password" 
                />
                
                <Input 
                    id="confirmPassword" 
                    label="Confirm New Password" 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={update} 
                    placeholder="Enter your new password again" 
                    autoComplete="new-password" 
                />
                
                <Button type="submit" loading={loading}>Reset Password</Button>
            </form>
        </AuthLayout>
    );
}

export default ResetPassword;