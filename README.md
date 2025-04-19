# 🚀 create-exbackend-app

A powerful Express.js backend boilerplate generator CLI with flexible configuration options, TypeScript support, MongoDB (with Mongoose/Prisma), auto-structured folders, and more.

---

## ✨ Features

- ⚡ Express.js scaffolding with clean architecture
- ✅ Supports both **JavaScript** and **TypeScript**
- ✅ Choose between **Prisma** or **Mongoose**
- ✅ Automatically installs dependencies
- ✅ Beautified CLI prompts and output
- ✅ Prettier + ESLint ready
- ✅ Fully customizable template structure
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

1. **Enter your project name:**

   - Type a name (e.g., `my-api`)
   - Or just press enter to use default: `my-app`

2. **Which language do you want to use?**

   - `Express + TS` (TypeScript)
   - `Express + JS` (JavaScript)

3. **Which ORM/ODM setup do you want?**
   - `Prisma`
   - `Mongoose`

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
│   └── app (file)
├── .env
├── package.json
├── .prettierrc
├── .gitignore
├── .eslintrc.json
├── tsconfig.json (if TypeScript)
├── index (file)
└── README.md
```

---

## 📦 Scripts

```bash
# Run in development mode
npm run dev

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
