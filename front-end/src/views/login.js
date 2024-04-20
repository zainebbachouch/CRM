import React, { useState } from 'react';

import facebook from "../images/facebook.png";
import google from "../images/google.png";
import twitter from "../images/twitter.png";
import crmIcon from "../images/crm.png";
import { Link ,  useNavigate } from 'react-router-dom';
import { useAuth } from './context/authContext';

import "../style/viewsStyle/loginStyle.css";
export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const { handleLogin } = useAuth(); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleLogin(formData);
            navigate("/");
        } catch (err) {
            console.error("Error object:", err);
        }
    };

    return (
        <>
            <div className="loginContainer d-flex justify-content-center align-items-center">
                <div className="loginForm d-flex flex-column align-items-center justify-content-center" >
                    <div className="iconContainer">
                        <img src={crmIcon} alt="" className="logo" />
                    </div>
                    <div className="signIn">
                        <h2>Sign In</h2>
                    </div>
                    <div className="loginSocialMedia">
                        <p className='text-muted text-center'>Login into your account using</p>
                        <div className="socialMediaIcons d-flex column-gap-3">
                            <button className="icon p-2">
                                <img src={facebook} alt="facebook logo" className='socialMediaIcon' />
                            </button>
                            <button className="icon p-2 ">
                                <img src={google} alt="google logo" className='socialMediaIcon' />
                            </button>
                            <button className="icon p-2">
                                <img src={twitter} alt="twitter logo" className='socialMediaIcon' />
                            </button>
                        </div>
                        <div className="loginInput mt-4">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mt-3">
                                    <label htmlFor="emailInput" className='text-muted' >Email address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="emailInput"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>
                                <div className="form-group mt-1">
                                    <div className='d-flex justify-content-between'>
                                        <label htmlFor="passwordInput" className='text-muted'>Password</label>
                                        <label className='forgotMessage'>Forgot Password</label>
                                    </div>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="passwordInput"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                                <div className="form-group mt-3">
                                    <button type="submit" className='btn loginButton w-100' >
                                        Login
                                    </button>
                                </div>
                            </form>
                            <span className="text-center mt-2">You don't have an account? </span>
                            <Link to="/register"> <button className="btn signupMessage">Sign up</button></Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
