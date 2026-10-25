import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');
  const { add } = useCart();
  const nav = useNavigate();

  useEffect(() => { api('/products/' + id).then(setP).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <p className="error pad">{err}</p>;
  if (!p) return <p className="muted pad">Loading…</p>;

  return (
    <div className="wrap detail">
      <img src={p.image} alt={p.name} />
      <div>
        <small className="muted">{p.category}</small>
        <h1>{p.name}</h1>
        <h2>{money(p.price)}</h2>
        <p>{p.description}</p>
        <p className="muted">{p.stock > 0 ? `${p.stock} in stock` : 'Currently sold out'}</p>
        {p.stock > 0 && (
          <div className="row gap">
            <input type="number" min="1" max={p.stock} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(p.stock, +e.target.value || 1)))} className="qty" />
            <button className="btn" onClick={() => { add(p, qty); nav('/cart'); }}>Add to cart</button>
          </div>
        )}
      </div>
    </div>
  );
}
