import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/authContext'; // Adjust the import path if necessary

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { handlePasswordReset } = useAuth(); // Assume this function exists in your auth context

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await handlePasswordReset(email);
            setMessage("If an account with that email exists, a password reset link has been sent.");
            setEmail("");
        } catch (err) {
            console.error("Error object:", err);
            setMessage("An error occurred while sending the reset link.");
        }
    };

    return (
        <div className="forgotPasswordContainer d-flex justify-content-center align-items-center">
            <div className="forgotPasswordForm d-flex flex-column align-items-center justify-content-center">
                <h2>Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mt-3">
                        <label htmlFor="emailInput" className='text-muted'>Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    <div className="form-group mt-3">
                        <button type="submit" className='btn resetButton w-100'>
                            Send Reset Link
                        </button>
                    </div>
                    {message && <p className="text-center mt-2">{message}</p>}
                </form>
            </div>
        </div>
    );
}
