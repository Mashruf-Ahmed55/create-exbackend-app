# 🚀 create-exbackend-app

A powerful Express.js backend boilerplate generator CLI with flexible configuration options, TypeScript support, MongoDB (with Mongoose/Prisma), auto-structured folders, and more.

---

## ✨ Features

- ⚡ Express.js scaffolding with clean architecture
- 🟨 JavaScript / 🟦 TypeScript
- 🔧 ESLint integration (optional)
- 🧬 MongoDB integration with choice of:
  - Mongoose (default)
  - Prisma ORM (optional)
- 📦 Auto-generated `.env` and `README.md`
- 📂 Folder structure with:
  - `src/config`
  - `src/controllers`
  - `src/routes`
  - `src/models`
  - `src/services`
  - `src/middlewares`
- 📊 Logging with `morgan`
- 🛡️ CORS and Cookie-Parser setup
- ✅ Installs latest versions of all packages

---

## 🧭 Usage

### Using `npx` (recommended)

```bash
npx create-exbackend-app
```

### Or install globally

```bash
npm install -g create-exbackend-app
create-exbackend-app
```

---

## 📋 CLI Prompts

When you run the CLI, it will ask:

1. **Project name?** (default: `my-app`)
2. **Use TypeScript?** (default: Yes)
3. **Use ESLint?** (default: Yes)
4. **Use Prisma ORM instead of Mongoose?** (default: No)

Your choices will generate a fully working backend boilerplate in seconds 🚀

---

## 📁 Project Structure

```
my-app/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── index.ts / index.js
├── .env
├── package.json
├── .prettierrc
├── .gitignore
├── .eslintrc.json
├── tsconfig.json (if TypeScript)
├── README.md
└── ...
```

---

## 📦 Scripts

```bash
# Run in development mode
npm run dev

# Build For TS no need if you use JS
npm run build

# Run Start
npm run start
```

---

## 🧰 Requirements

- Node.js >= 18.x
- npm >= 9.x

---

## 🤝 Contributing

Have a suggestion or found a bug? Open an issue or PR — all contributions are welcome!

---

## ✍️ Author

Made with 💻 and ☕ by [Mashruf Ahmed](https://github.com/Mashruf-Ahmed55)

---
