import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(email, password);
      nav(loc.state?.from || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (e2) { setErr(e2.message); }
  };
  return (
    <form onSubmit={submit} className="form narrow">
      <h1>Sign in</h1>
      <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {err && <p className="error">{err}</p>}
      <button className="btn">Sign in</button>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}
