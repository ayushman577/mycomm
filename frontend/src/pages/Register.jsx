import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../components/AuthLayout';

import Button from '../components/Button';

import Input from '../components/Input';

import { getApiError, register } from '../services/authService';

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '' });

    const [errors, setErrors] = useState({});

    const [apiError, setApiError] = useState('');

    const [loading, setLoading] = useState(false);

    const update = (event) => setForm({ ...form, [event.target.id]: event.target.value });

    const submit = async (event) => {

        event.preventDefault();

        const nextErrors = {};

        if (!form.username.trim()) nextErrors.username = 'Username is required.';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
        if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
        if (form.password.length < 6) nextErrors.password = 'Use at least 6 characters.';
        if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

        setErrors(nextErrors);

        setApiError('');

        if (Object.keys(nextErrors).length) return;

        setLoading(true);

        try {

            await register({ 
                username: form.username.trim(), 
                email: form.email.trim(), 
                phone: form.phone.trim(), 
                password: form.password 
            });

            sessionStorage.setItem('verificationEmail', form.email.trim());

            navigate('/verify-email', { state: { email: form.email.trim() } });

        } catch (error) {

            setApiError(getApiError(error, 'We could not create your account. Please try again.'));

            setForm(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));

        } finally {

            setLoading(false);

        }

    };

    return (

        <AuthLayout 
            title="Create your account" 
            description="Create your profile and start building your community." 
            alert={apiError} 
            footer={<>Already registered? <Link to="/login">Sign in here</Link></>}
        >

            <form onSubmit={submit} noValidate>

                <div className="form-grid">

                    <Input 
                        id="username" 
                        label="Username" 
                        value={form.username} 
                        onChange={update} 
                        placeholder="Alex Martin" 
                        autoComplete="username" 
                        error={errors.username} 
                    />

                    <Input 
                        id="phone" 
                        label="Phone" 
                        value={form.phone} 
                        onChange={update} 
                        placeholder="1234567890" 
                        autoComplete="tel" 
                        error={errors.phone} 
                    />

                </div>

                <Input 
                    id="email" 
                    label="Email address" 
                    type="email" 
                    value={form.email} 
                    onChange={update} 
                    placeholder="name@company.com" 
                    autoComplete="email" 
                    error={errors.email} 
                />

                <Input 
                    id="password" 
                    label="Password" 
                    type="password" 
                    value={form.password} 
                    onChange={update} 
                    placeholder="At least 6 characters" 
                    autoComplete="new-password" 
                    error={errors.password} 
                />

                <Input 
                    id="confirmPassword" 
                    label="Confirm password" 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={update} 
                    placeholder="Repeat your password" 
                    autoComplete="new-password" 
                    error={errors.confirmPassword} 
                />

                <Button type="submit" loading={loading}>Create Account</Button>

            </form>

        </AuthLayout>

    );

}

export default Register;