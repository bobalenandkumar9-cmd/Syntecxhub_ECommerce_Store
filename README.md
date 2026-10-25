# Syntecxhub E-Commerce Store (MERN)

Full-stack e-commerce app built for the Syntecxhub Web Development internship (Project 1).

## Requirements covered
| Requirement | Where |
|---|---|
| Full-fledged e-commerce app | React (Vite) client + Express/MongoDB API |
| User authentication & authorization with JWT | `server/routes/auth.js`, `server/middleware/auth.js` (roles: `user`, `admin`) |
| Product listings, cart, checkout | Search/filter/sort/pagination, localStorage cart, checkout with server-side pricing and atomic stock checks |
| Admin dashboard for products & orders | `/admin`: stats, product CRUD, order status updates (cancelling restocks) |
| Deploy for production | `render.yaml` (API), `client/vercel.json` (client), MongoDB Atlas |

## Tech
React 18, React Router 6, Vite, Node, Express 4, MongoDB + Mongoose, bcryptjs, jsonwebtoken.

## Run locally
Requires Node 18+ and MongoDB (local or Atlas).

```bash
# 1. API
cd server
cp .env.example .env      # edit MONGO_URI and JWT_SECRET
npm install
npm run seed              # sample products + admin account
npm run dev               # http://localhost:5000

# 2. Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Default admin (from `.env`): `admin@store.com` / `Admin@12345`. Change it before deploying.
New sign-ups are always regular users; admins can only be created by the seed script.

## API summary
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | signed in |
| GET | `/api/products` (`q, category, sort, page, limit`), `/api/products/:id`, `/api/products/categories` | public |
| POST/PUT/DELETE | `/api/products`, `/api/products/:id` | admin |
| POST | `/api/orders` | signed in |
| GET | `/api/orders/mine` | signed in |
| GET | `/api/orders`, `/api/orders/admin/stats` | admin |
| PUT | `/api/orders/:id/status` | admin |

## Deploy
1. **Database:** create a free MongoDB Atlas cluster, allow network access, copy the connection string.
2. **API on Render:** New > Blueprint (uses `render.yaml`) or New > Web Service with root `server`, build `npm install`, start `npm start`. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (your frontend URL, no trailing slash). Run `npm run seed` once (locally with the Atlas URI works too).
3. **Client on Vercel/Netlify:** root directory `client`, build `npm run build`, output `dist`. Set `VITE_API_URL=https://<your-api>.onrender.com/api`. SPA rewrites are already configured.
4. Put the live URLs here: **Live app:** _add link_ · **API:** _add link_

## Submission checklist
- [ ] Repo named `Syntecxhub_ECommerce_Store`, full source pushed
- [ ] LinkedIn post mentioning @Syntecxhub
- [ ] Submission Form filled with the repo and live links

## Possible extensions
Real payments (Stripe), image upload (Cloudinary), product reviews, email order confirmations.
