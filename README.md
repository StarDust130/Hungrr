# 🍽️ Hungrr

**Scan. Order. Eat.**  
A slick QR-based ordering system for cafes and restaurants — no waiters, no delays, just good food faster 😎


---

## 🚀 What is Hungrr?

Hungrr is a full-stack web app that lets customers **scan a QR code**, browse the **digital menu**, **place an order**, and optionally **pay** — all from their phone.

> 🧠 Built to help **local cafés** go digital without expensive hardware or complex apps.

---

## 🎯 The Problem It Solves

⛔ Long wait times for placing orders  
⛔ Staff confusion and missed orders  
⛔ Paper menus, slow service  
⛔ Costly POS systems for small owners

✅ Self-service ordering from the table  
✅ Clean digital menus per table  
✅ No app download needed  
✅ Orders directly to the kitchen panel  

---

## 🛠 Tech Stack

### 💻 Frontend
- **Next.js** + **TypeScript**
- **Tailwind CSS** for fast, clean UI
- **Clerk** for user authentication

### 🔐 Backend
- **Django** (Python)
- **PostgreSQL** (database)
- **Django REST Framework** (for APIs)

### ⚙️ Dev Tools
- **Concurrently** to run both dev servers
- **Vercel** / **Render** for deployment
- **Postman** for API testing

---

## 🧪 How it works

1. ☕ Cafe owner signs up and creates tables + menus  
2. 📲 Each table gets a unique QR code (links to a table-specific page)  
3. 🧑‍🍳 Customer scans the QR → browses menu → places order  
4. 🧾 Payment is manual/UPI in v1 (automated later)  
5. 📡 Order appears in kitchen dashboard in real-time

---

## 💡 Why I Built Hungrr

Hey! I’m **Chandrashekhar**, a 19-year-old dev from Bhilai 🇮🇳  
I was tired of waiting too long for chai — and realized how many cafes still take manual orders 📝

> Hungrr is my attempt to bring simple tech to **local Indian businesses** that need it most.

---

## 📁 Project Structure

```
hungrr/
├── frontend/ # Next.js + Clerk Auth + shadcn UI
└── backend/ # Django + PostgreSQL + API

```


---

## 🔮 Roadmap

- [x] Manual UPI payment with order tracking
- [x] Clerk-based secure login for owners
- [ ] QR code auto-generation per table
- [ ] Auto payment verification (license-based)
- [ ] Kitchen panel for real-time orders
- [ ] Analytics & reports (popular items, hours)
- [ ] Invoice / Bill generation

---

## 📸 Screenshots (coming soon)

- ✅ Table QR scan view  
- ✅ Menu & order interface  
- ✅ Admin dashboard  

---

## 📬 Contact

💬 Feedback or want to try Hungrr in your café?

📧 Email: csyadav0513@gmail.com  

---

## 🖤 Made With Love

> For every chai lover who waited too long 🫖  
> For every local café ready to level up 📈  
> **#HungrrHaiTohSahiHai**
