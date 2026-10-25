import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  return (
    <header className="nav">
      <Link to="/" className="brand">Syntecxhub Store</Link>
      <nav>
        <NavLink to="/">Shop</NavLink>
        <NavLink to="/cart">Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>
        {user && <NavLink to="/orders">My orders</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {user ? (
          <button className="link" onClick={() => { logout(); nav('/'); }}>Sign out ({user.name.split(' ')[0]})</button>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <NavLink to="/register" className="btn small">Create account</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
