import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const Auth = () => {
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error.message);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSignup}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Signup</button>
      </form>
      <p>Forgot password? <button onClick={handleForgotPassword}>Reset Password</button></p>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Auth;