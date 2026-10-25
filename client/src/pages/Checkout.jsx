import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ fullName: user?.name || '', phone: '', address: '', city: '', postalCode: '' });
  const [payment, setPayment] = useState('COD');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (items.length === 0) return <p className="wrap pad">Your cart is empty.</p>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await api('/orders', { method: 'POST', body: { items: items.map((i) => ({ product: i._id, qty: i.qty })), shippingAddress: f, paymentMethod: payment } });
      clear();
      nav('/orders', { state: { placed: true } });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <div className="wrap two">
      <form onSubmit={submit} className="form">
        <h1>Checkout</h1>
        <label>Full name<input required value={f.fullName} onChange={set('fullName')} /></label>
        <label>Phone<input required value={f.phone} onChange={set('phone')} /></label>
        <label>Address<input required value={f.address} onChange={set('address')} /></label>
        <div className="row gap">
          <label className="grow">City<input required value={f.city} onChange={set('city')} /></label>
          <label className="grow">Postal code<input required value={f.postalCode} onChange={set('postalCode')} /></label>
        </div>
        <label>Payment
          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="COD">Cash on delivery</option>
            <option value="CARD">Card (demo, no real charge)</option>
          </select>
        </label>
        {err && <p className="error">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${money(total)}`}</button>
      </form>
      <aside className="panel">
        <h3>Order summary</h3>
        {items.map((i) => <div className="row" key={i._id}><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
        <hr /><div className="row"><strong>Total</strong><strong>{money(total)}</strong></div>
      </aside>
    </div>
  );
}
