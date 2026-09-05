import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import { getApiError, login } from '../services/authService';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const update = (event) => setForm({ ...form, [event.target.id]: event.target.value });
    
    const submit = async (event) => {
        event.preventDefault(); 
        setError('');
        
        if (!form.email || !form.password) { 
            setError('Please enter your email and password.'); 
            return; 
        }
        
        setLoading(true);
        try { 
            await login(form); 
            navigate('/dashboard'); 
        } catch (requestError) { 
            setError(getApiError(requestError, 'We could not log you in. Please check your email and password.')); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <AuthLayout 
            title="Log in to MyComm" 
            description="Access your dashboard and manage your communities with ease." 
            alert={error} 
            success={location.state?.message} 
            footer={<>New to MyComm? <Link to="/register">Create an account</Link></>}
        >
            <form onSubmit={submit} noValidate>
                <Input 
                    id="email" 
                    label="Email address" 
                    type="email" 
                    value={form.email} 
                    onChange={update} 
                    placeholder="name@company.com" 
                    autoComplete="email" 
                />
                <Input 
                    id="password" 
                    label="Password" 
                    type="password" 
                    value={form.password} 
                    onChange={update} 
                    placeholder="Your password" 
                    autoComplete="current-password" 
                />
                <div className="form-options">
                    <Link to="/forgot-password">Forgot password?</Link>
                </div>
                <Button type="submit" loading={loading}>Log in</Button>
            </form>
        </AuthLayout>
    );
}

export default Login;