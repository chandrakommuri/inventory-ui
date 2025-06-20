import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;

    // Send token to backend for verification
    const res = await fetch('https://sri4wayexpress.in/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (res.ok) {
      const userData = await res.json();
      console.log("Welcome:", userData.name);
      localStorage.setItem('token', token);
      localStorage.setItem('userData', userData);
      navigate('/');
    } else {
      alert("Unauthorized or not in whitelist");
    }
  };

  return (
    <div>
      <GoogleLogin onSuccess={handleSuccess} onError={() => alert("Login failed")} />
    </div>
  );
};

export default LoginPage;