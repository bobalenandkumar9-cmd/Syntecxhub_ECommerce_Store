import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../api.js';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const nav = useNavigate();
  if (items.length === 0)
    return <div className="wrap pad"><h1>Your cart is empty</h1><Link className="btn" to="/">Browse products</Link></div>;
  return (
    <div className="wrap">
      <h1>Your cart</h1>
      <div className="table">
        {items.map((i) => (
          <div className="line" key={i._id}>
            <img src={i.image} alt="" />
            <div className="grow"><Link to={`/product/${i._id}`}>{i.name}</Link><div className="muted">{money(i.price)} each</div></div>
            <input type="number" className="qty" min="1" max={i.stock} value={i.qty} onChange={(e) => setQty(i._id, +e.target.value || 1)} />
            <strong className="amt">{money(i.price * i.qty)}</strong>
            <button className="link" onClick={() => remove(i._id)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="summary">
        <span>Total</span><strong>{money(total)}</strong>
        <button className="btn" onClick={() => nav('/checkout')}>Go to checkout</button>
      </div>
    </div>
  );
}
