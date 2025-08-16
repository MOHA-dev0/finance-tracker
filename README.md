# Fivest

A modern **personal finance tracking app** built with **React + Vite + TypeScript**.  
The app helps users manage expenses, budgets, and visualize financial insights with clean UI components powered by **ShadCN UI**, **Radix Primitives**, and **Recharts**.

---

## 🚀 Tech Stack

- **[Vite](https://vitejs.dev/)** – fast build tool for modern web apps
- **[React 18](https://react.dev/)** – component-based UI library
- **[TypeScript](https://www.typescriptlang.org/)** – type safety
- **[ShadCN UI](https://ui.shadcn.com/)** – beautiful, accessible UI components
- **[Radix UI](https://www.radix-ui.com/)** – headless UI primitives
- **[Tailwind CSS](https://tailwindcss.com/)** – utility-first styling
- **[Supabase](https://supabase.com/)** – backend-as-a-service (auth, database, APIs)
- **[TanStack Query](https://tanstack.com/query/latest)** – data fetching and caching
- **[Recharts](https://recharts.org/)** – data visualization

---

## 📂 Project Structure

```
src/
 ├─ components/     # UI components (ShadCN + custom)
 ├─ pages/          # Main app pages
 ├─ hooks/          # Custom React hooks
 ├─ lib/            # Utilities & API clients
 ├─ styles/         # Tailwind/global styles
 └─ main.tsx        # App entry point
```

---

## ⚡️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/finance-tracker.git
cd finance-tracker
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Run the app

```bash
npm run dev
```

App will be available at: [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## ✨ Features

- 📊 Track expenses and budgets
- 🔒 Authentication with Supabase
- 📅 Calendar-based expense logging
- 📈 Charts & insights with Recharts
- 🎨 Clean UI with ShadCN + Radix + Tailwind
- ⚡️ Fast dev environment with Vite

---

## 🛠 Development Notes

- Code style enforced with **ESLint** + **TypeScript**
- UI animations with **tailwindcss-animate**
- Responsive design out of the box
- Organized using modern React patterns (hooks, context, query)

---

## 📜 License

MIT License © 2025 MOHADev
