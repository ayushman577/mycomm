import { useState } from 'react';

function Input({ label, id, error, type = 'text', ...props }) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && visible ? 'text' : type;

    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            <div className="input-wrap">
                <input 
                    id={id} 
                    type={inputType} 
                    aria-invalid={Boolean(error)} 
                    aria-describedby={error ? `${id}-error` : undefined} 
                    {...props} 
                />
                {isPassword && (
                    <button 
                        className="password-toggle" 
                        type="button" 
                        onClick={() => setVisible(!visible)} 
                        aria-label={visible ? 'Hide password' : 'Show password'}
                    >
                        {visible ? 'Hide' : 'Show'}
                    </button>
                )}
            </div>
            {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
        </div>
    );
}

export default Input;