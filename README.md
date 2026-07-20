# Exit Caff — Frontend

React 19 + TypeScript + Vite customer site and admin portal for the Exit Caff Bakery & Café Management
System. Royal black/gold theme with a dark/light toggle.

## Stack

React 19, TypeScript, Vite, React Router 7, Redux Toolkit, TanStack Query, Axios, React Hook Form + Zod,
Tailwind CSS v4, Framer Motion, React Icons, react-hot-toast.

## Structure

```
src/
  api/            Axios client (JWT + refresh-token interceptor) and endpoint modules
  app/            Redux store, TanStack Query client, theme sync, router-agnostic providers
  components/
    ui/            Reusable primitives (Button, Input, Modal, Badge, Spinner)
    layout/        Header, Footer, Layout (customer), AdminLayout (role-gated)
  features/
    auth/           authSlice
    cart/           cartSlice (persisted to localStorage)
    products/       ProductCard
  pages/           Customer-facing route components
  pages/admin/     Admin portal route components
  types/           DTOs mirroring the backend API contracts
```

## Current scope (core slice)

Built: Home, Menu (search/filter/sort/paginate), Product Detail, Cart, Checkout (guest checkout), Order
Confirmation, Login/Register, and an Admin Portal (role-gated: SuperAdmin/Admin/Manager/Staff) with
Dashboard, Categories, Products, Orders (status workflow), Customers.

Stubbed with a "coming soon" placeholder (routed, but not built out): About Us, Our Story, Custom Cake
Orders, Catering, Gallery, Blog, FAQ, Contact, Careers, Privacy Policy, Terms. Wire these up to real content
and, where applicable, new backend endpoints as those modules are built.

## Setup

```bash
cp .env.example .env      # set VITE_API_BASE_URL to your running backend
npm install
npm run dev                # http://localhost:5173
```

Requires the backend API running (see `../Exit-Cafe-backend/README.md`) for any page that fetches data —
without it, pages render but queries stay in a loading/error state.

## Build & Docker

```bash
npm run build               # tsc -b && vite build -> dist/
docker build -t exitcaff-frontend --build-arg VITE_API_BASE_URL=/api .
docker run -p 8081:80 exitcaff-frontend
```

`VITE_API_BASE_URL` is baked in at build time (Vite env vars are compile-time, not runtime) — rebuild the
image if the API origin changes. The Docker image serves the built static files via nginx with SPA
fallback routing (`nginx.conf`).

## Auth

Access/refresh tokens are stored in `localStorage`. The Axios response interceptor auto-refreshes on a 401
and retries the original request once; if refresh fails it dispatches an `auth:logout` window event that
clears Redux auth state app-wide. Admin routes (`/admin/*`) check the user's role client-side
(`AdminLayout`) — this is a UX gate only, not a security boundary; the backend's `AdminOnly`/`StaffAndAbove`
policies are the actual enforcement.

## Known items

- Cart/checkout totals shown client-side are for display only; the backend recomputes subtotal, tax and
  delivery fee authoritatively on order creation.
- Admin dashboard shows only metrics derivable from existing endpoints (order counts by status, product/
  customer counts, recent orders) — revenue and sales-chart widgets need the Reports/Analytics module,
  which isn't built yet.
- `imageUrls` on the admin product form is a comma-separated text field, not a real upload widget — file
  upload wiring depends on a backend storage endpoint that's out of scope for this slice.
