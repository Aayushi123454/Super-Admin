import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();

  const [phone_number, setPhone] = useState('');
  const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
    const savedPhone = localStorage.getItem("phone_number");
    const savedPassword = localStorage.getItem("password");

    if (savedPhone && savedPassword) {
      setPhone(savedPhone);
      setPassword(savedPassword);
       setRememberMe(true);
    }
  }, []);

   const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem("phone_number");
      localStorage.removeItem("password");
    }
  };

  

  
  const handleLogin = (e) => {
    e.preventDefault();

    if (phone_number === '7807425002' && password === 'admin') {
      toast.success("Login Successful!", { position: "top-center", autoClose: 2000 });

   
      if (rememberMe) {
        localStorage.setItem("phone_number", phone_number);
        localStorage.setItem("password", password);
      }

      setTimeout(() => navigate('/Dashboard'), 2000);
    } else {
      toast.error("Invalid Phone Number or Password", { position: "top-center", autoClose: 3000 });
    }
  };


  return (
    <>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">🌿</span>
              <h1 className="logo-text">Ayurmuni</h1>
            </div>
            <p className="login-subtitle">Welcome back! Please sign in to your account.</p>


          </div>

          <form className="login-form" >
            <div className='form-group'>
              <label htmlFor="phone_number" className="form-label">
              Phone Number
              </label>
              <input
                type="number"
                name="phone_number"

                placeholder="Enter your phone number"
                value={phone_number}
                onChange={(e) => setPhone(e.target.value)}
                className='form-input'
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className='form-input'
              />
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="checkbox-input"
                   checked={rememberMe}
                           onChange={handleRememberMeChange}
                />
                <span>  Remember me </span>

              </label>
              {/* <a href="#" className="forgot-password">
                Forgot password?
              </a> */}
            </div>
            <button className='login-btn' onClick={handleLogin}>Login</button>

          </form>
        </div>
      </div>
            <ToastContainer position="top-center" autoClose={1000} />

    </>
  )
}

export default Login;
