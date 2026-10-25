import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await register(f.name, f.email, f.password); nav('/'); } catch (e2) { setErr(e2.message); }
  };
  return (
    <form onSubmit={submit} className="form narrow">
      <h1>Create account</h1>
      <label>Name<input required value={f.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>Password (6+ characters)<input type="password" minLength="6" required value={f.password} onChange={set('password')} /></label>
      {err && <p className="error">{err}</p>}
      <button className="btn">Create account</button>
      <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
    </form>
  );
}
