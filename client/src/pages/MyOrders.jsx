import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, money } from '../api.js';

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const loc = useLocation();
  useEffect(() => { api('/orders/mine').then(setOrders).catch(() => setOrders([])); }, []);
  return (
    <div className="wrap">
      <h1>My orders</h1>
      {loc.state?.placed && <p className="ok">Order placed. Thank you!</p>}
      {orders === null && <p className="muted">Loading…</p>}
      {orders?.length === 0 && <p className="muted">You haven't placed any orders yet.</p>}
      {orders?.map((o) => (
        <div className="panel" key={o._id}>
          <div className="row"><strong>Order #{o._id.slice(-6)}</strong><span className={`tag ${o.status}`}>{o.status}</span></div>
          <div className="muted">{new Date(o.createdAt).toLocaleString()} · {o.paymentMethod}</div>
          {o.items.map((i, k) => <div className="row" key={k}><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
          <hr /><div className="row"><strong>Total</strong><strong>{money(o.totalPrice)}</strong></div>
        </div>
      ))}
    </div>
  );
}
