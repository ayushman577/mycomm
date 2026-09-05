import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../components/AuthLayout';

import Button from '../components/Button';

import Input from '../components/Input';

import { forgotPassword, getApiError } from '../services/authService';

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');

    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);

    const submit = async (event) => {

        event.preventDefault();

        setError('');

        if (!/^\S+@\S+\.\S+$/.test(email)) {

            setError('Enter a valid email address.');

            return;

        }

        setLoading(true);

        try {

            await forgotPassword({ email });

            navigate('/reset-password', { state: { email } });

        } catch (requestError) {

            setError(getApiError(requestError, 'We could not send the recovery code. Please try again.'));

        } finally {

            setLoading(false);

        }

    };

    return (

        <AuthLayout 
            title="Recover your account" 
            description="Enter your registered email address to receive a recovery code." 
            alert={error} 
            footer={<>Remember your credentials? <Link to="/login">Return to sign in</Link></>}

        >

            <form onSubmit={submit} noValidate>

                <Input 
                    id="email" 
                    label="Email address" 
                    type="email" 
                    value={email} 
                    onChange={(event) => setEmail(event.target.value)} 
                    placeholder="name@yourcompany.com" 
                    autoComplete="email" 
                />

                <Button type="submit" loading={loading}>Send Recovery Code</Button>

            </form>

        </AuthLayout>

    );

}

export default ForgotPassword;