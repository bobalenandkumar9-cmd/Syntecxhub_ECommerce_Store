import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Home() {
  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [err, setErr] = useState('');
  const { add } = useCart();

  useEffect(() => { api('/products/categories').then(setCats).catch(() => {}); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ q, category, sort, page, limit: 8 });
      api('/products?' + qs).then((d) => { setData(d); setErr(''); }).catch((e) => setErr(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, sort, page]);

  return (
    <div className="wrap">
      <section className="hero">
        <h1>Everyday gear, delivered.</h1>
        <p className="muted">{data.total} products across electronics, fashion, home and sport.</p>
      </section>
      <div className="filters">
        <input placeholder="Search products" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option>All</option>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
        </select>
      </div>
      {err && <p className="error">{err}. Check that the API is running and VITE_API_URL is correct.</p>}
      <div className="grid">
        {data.products.map((p) => (
          <article key={p._id} className="card">
            <Link to={`/product/${p._id}`}><img src={p.image} alt={p.name} loading="lazy" /></Link>
            <div className="card-body">
              <small className="muted">{p.category}</small>
              <Link to={`/product/${p._id}`}><h3>{p.name}</h3></Link>
              <div className="row">
                <strong>{money(p.price)}</strong>
                {p.stock > 0 ? <button className="btn small" onClick={() => add(p)}>Add to cart</button> : <span className="muted">Sold out</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!err && data.products.length === 0 && <p className="muted pad">No products match your search. Try a different keyword or category.</p>}
      {data.pages > 1 && (
        <div className="pager">
          <button className="btn ghost small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {data.pages}</span>
          <button className="btn ghost small" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
