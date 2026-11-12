# Contributing to GRIDLOCK

Thank you for your interest in contributing to **GRIDLOCK**! We welcome community contributions to help make personal discipline, accountability, and AI coaching accessible, high-performance, and extensible.

---

## 📜 Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure an open, welcoming, and harassment-free environment for everyone.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or `yarn`)
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** (for local Android emulation) or **Xcode** (for iOS simulation on macOS)
- **Expo Go App** on your physical phone (optional for testing on physical devices)

### Getting Started

1. **Fork the Repository** on GitHub:
   Click the "Fork" button on the top right of [github.com/anshumanholkar/Gridlock](https://github.com/anshumanholkar/Gridlock).

2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/Gridlock.git
   cd Gridlock
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Verify TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

5. **Start the local Expo development server**:
   ```bash
   npx expo start
   ```

---

## 📐 Project Architecture & Code Conventions

- **Component Layering**:
  - `src/screens/`: High-level tab screens and modals.
  - `src/components/`: Reusable, modular UI components.
  - `src/services/`: External integrations (Gemini AI, Supabase, AsyncStorage).
  - `src/types.ts`: Strict TypeScript domain interfaces.
  - `src/theme.ts`: Reactive theme tokens and palette system.
- **Strict Typing**: All components and helpers must be fully typed. Do not use `any` unless absolutely necessary.
- **Theme Reactivity**: All visual components must resolve styles dynamically using `getAppTheme(user?.theme)` to ensure instantaneous palette switches.

---

## 🌿 Branching & Git Commit Guidelines

We follow standard Conventional Commits:
- `feat:` A new feature or major enhancement.
- `fix:` A bug fix.
- `docs:` Documentation updates or additions.
- `refactor:` Code improvements without altering behavior.
- `style:` Formatting, UI refinements, styling adjustments.
- `test:` Adding or updating tests.

### Submitting a Pull Request

1. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes:
   ```bash
   git commit -m "feat: implement your feature description"
   ```
3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a Pull Request against the `main` branch of the upstream repository with a clear description of the problem solved.

---

## 💬 Getting Help & Discussions

If you encounter any issues or have questions regarding architecture, feel free to open a [GitHub Issue](https://github.com/anshumanholkar/Gridlock/issues).
