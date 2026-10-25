import { useEffect, useState } from 'react';
import { api, money } from '../../api.js';

const empty = { name: '', description: '', price: '', image: '', category: '', stock: '' };
const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="wrap">
      <h1>Admin dashboard</h1>
      <div className="tabs">
        {['overview', 'products', 'orders'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {tab === 'overview' && <Overview />}
      {tab === 'products' && <Products />}
      {tab === 'orders' && <Orders />}
    </div>
  );
}

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/orders/admin/stats').then(setS); }, []);
  if (!s) return <p className="muted">Loading…</p>;
  return (
    <div className="stats">
      <div className="panel"><small>Revenue</small><h2>{money(s.revenue)}</h2></div>
      <div className="panel"><small>Orders</small><h2>{s.orders}</h2></div>
      <div className="panel"><small>Products</small><h2>{s.products}</h2></div>
      <div className="panel"><small>Customers</small><h2>{s.users}</h2></div>
    </div>
  );
}

function Products() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api('/products?limit=100').then((d) => setList(d.products));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setErr('');
    const body = { ...form, price: +form.price, stock: +form.stock };
    try {
      await api(editing ? `/products/${editing}` : '/products', { method: editing ? 'PUT' : 'POST', body });
      setForm(empty); setEditing(null); load();
    } catch (e2) { setErr(e2.message); }
  };
  const edit = (p) => { setEditing(p._id); setForm({ name: p.name, description: p.description, price: p.price, image: p.image, category: p.category, stock: p.stock }); window.scrollTo(0, 0); };
  const del = async (p) => { if (confirm(`Delete "${p.name}"?`)) { await api('/products/' + p._id, { method: 'DELETE' }); load(); } };

  return (
    <>
      <form onSubmit={save} className="panel formgrid">
        <h3>{editing ? 'Edit product' : 'Add product'}</h3>
        <input required placeholder="Name" value={form.name} onChange={set('name')} />
        <input placeholder="Category" value={form.category} onChange={set('category')} />
        <input required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={set('price')} />
        <input required type="number" min="0" placeholder="Stock" value={form.stock} onChange={set('stock')} />
        <input placeholder="Image URL" value={form.image} onChange={set('image')} className="span2" />
        <textarea placeholder="Description" value={form.description} onChange={set('description')} className="span2" />
        {err && <p className="error span2">{err}</p>}
        <div className="span2 row gap">
          <button className="btn">{editing ? 'Save changes' : 'Add product'}</button>
          {editing && <button type="button" className="btn ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>
      <div className="scroll">
        <table>
          <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id}>
                <td><img src={p.image} alt="" className="thumb" /></td><td>{p.name}</td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td>
                <td className="nowrap"><button className="link" onClick={() => edit(p)}>Edit</button> <button className="link danger" onClick={() => del(p)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Orders() {
  const [orders, setOrders] = useState(null);
  const load = () => api('/orders').then(setOrders);
  useEffect(() => { load(); }, []);
  const update = async (id, status) => { await api(`/orders/${id}/status`, { method: 'PUT', body: { status } }); load(); };
  if (!orders) return <p className="muted">Loading…</p>;
  if (orders.length === 0) return <p className="muted">No orders yet.</p>;
  return (
    <div className="scroll">
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Ship to</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-6)}<br /><small className="muted">{new Date(o.createdAt).toLocaleDateString()}</small></td>
              <td>{o.user?.name}<br /><small className="muted">{o.user?.email}</small></td>
              <td>{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</td>
              <td>{o.shippingAddress.address}, {o.shippingAddress.city}</td>
              <td>{money(o.totalPrice)}</td>
              <td><select value={o.status} onChange={(e) => update(o._id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
