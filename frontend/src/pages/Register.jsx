import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';

import { getApiError, register } from '../services/authService';

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);


    /* =====================================================
       UPDATE FORM
    ===================================================== */

    const update = (event) => {

        setForm({
            ...form,
            [event.target.id]: event.target.value
        });

    };


    /* =====================================================
       SUBMIT REGISTRATION
    ===================================================== */

    const submit = async (event) => {

        event.preventDefault();

        const nextErrors = {};


        /* =================================================
           FRONTEND VALIDATION
        ================================================= */

        if (!form.username.trim()) {
            nextErrors.username = 'Username is required.';
        }

        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
            nextErrors.email = 'Enter a valid email address.';
        }

        if (!form.phone.trim()) {
            nextErrors.phone = 'Phone number is required.';
        }

        if (form.password.length < 6) {
            nextErrors.password = 'Use at least 6 characters.';
        }

        if (form.password !== form.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match.';
        }


        setErrors(nextErrors);
        setApiError('');


        /* =================================================
           STOP IF VALIDATION FAILS
        ================================================= */

        if (Object.keys(nextErrors).length) {
            return;
        }


        setLoading(true);


        try {

            const email = form.email.trim();


            /* =============================================
               REGISTER USER
            ============================================= */

            await register({
                username: form.username.trim(),
                email,
                phone: form.phone.trim(),
                password: form.password
            });


            /* =============================================
               STORE VERIFICATION EMAIL
            ============================================= */

            sessionStorage.setItem(
                'verificationEmail',
                email
            );


            /* =============================================
               GO TO OTP PAGE
            ============================================= */

            navigate('/verify-email', {
                state: {
                    email
                }
            });


        } catch (error) {

            const message = getApiError(
                error,
                'We could not create your account. Please try again.'
            );


            /* =============================================
               EXISTING UNVERIFIED EMAIL
            ============================================= */

            if (
                message ===
                'Email already registered. Please verify your email or request a new OTP.'
            ) {

                const email = form.email.trim();


                sessionStorage.setItem(
                    'verificationEmail',
                    email
                );


                navigate('/verify-email', {
                    state: {
                        email
                    }
                });


                return;
            }


            /* =============================================
               OTHER ERRORS
            ============================================= */

            setApiError(message);


            /* Clear passwords */

            setForm(previous => ({
                ...previous,
                password: '',
                confirmPassword: ''
            }));

        } finally {

            setLoading(false);

        }
    };


    /* =====================================================
       UI
    ===================================================== */

    return (

        <AuthLayout
            title="Create your account"
            description="Create your profile and start building your community."
            alert={apiError}
            footer={
                <>
                    Already registered?{' '}
                    <Link to="/login">
                        Sign in here
                    </Link>
                </>
            }
        >

            <form
                onSubmit={submit}
                noValidate
            >

                {/* USERNAME + PHONE */}

                <div
                    className="form-grid"
                    style={{ alignItems: 'start' }}
                >

                    <Input
                        id="username"
                        label="Username"
                        value={form.username}
                        onChange={update}
                        placeholder="Ayushman"
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


                {/* EMAIL */}

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


                {/* PASSWORD */}

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


                {/* CONFIRM PASSWORD */}

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


                {/* SUBMIT */}

                <Button
                    type="submit"
                    loading={loading}
                >
                    Create Account
                </Button>

            </form>

        </AuthLayout>
    );
}

export default Register;
