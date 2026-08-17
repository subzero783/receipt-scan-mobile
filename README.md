# Receipt Scan Mobile App 👋

Receipt Scan Mobile is a universal cross-platform mobile application built with **React Native** and **Expo** (v57.0.0). It allows users to capture or upload receipts, extract key financial information using an AI backend, and manage expenses for tax deductions and general bookkeeping.

---

## Key Features

- **Secure Authentication**: Traditional sign-in and sign-up with email and password, as well as placeholders for OAuth (Google, Apple).
- **Interactive Dashboard**: View monthly spending graphs, stats (scanned count, category breakdown), and browse a detailed log of scanned receipts.
- **Smart Camera Scanner**: Align receipts inside a viewfinder with real-time horizontal scan animation, adjust camera flash, or select images from the system gallery.
- **AI Extraction & Detail Editing**: Modify auto-extracted receipt data including Merchant Name, Transaction Date, Total Amount, and Tax Categories.
- **Export Options**: Export invoice summaries as PDF files or raw data as CSV tables.
- **Universal Build**: Fully optimized and runs natively on iOS, Android, and Web browsers.

---

## Directory Architecture

The project adheres to a clean architecture dividing routing paths, screen representations, and reusable UI components.

```text
├── assets/                  # Shared assets (images, typography, icons)
├── src/
│   ├── app/                 # Expo Router route mapping (URLs)
│   │   ├── _layout.jsx      # Navigation stack layout
│   │   ├── index.jsx        # Login route wrapper
│   │   ├── signup.jsx       # Signup route wrapper
│   │   ├── dashboard.jsx    # Dashboard route wrapper
│   │   ├── settings.jsx     # Settings route wrapper
│   │   └── receipt/
│   │       └── [id].jsx     # Dynamic receipt details wrapper
│   │
│   ├── screens/             # Dedicated screen implementations (UI logic & styles)
│   │   ├── login/           # Login screen & styles
│   │   ├── signup/          # Signup screen & styles
│   │   ├── dashboard/       # Dashboard screen & styles
│   │   ├── settings/        # Settings screen & styles
│   │   └── receipt/         # Receipt detail screen & styles
│   │
│   ├── components/          # Reusable shared UI components
│   │   ├── BottomTabBar/    # Main navigation tab bar
│   │   ├── animated-icon/   # App branding icons (native & web versions)
│   │   ├── themed-text/     # Dynamic typography matching active color scheme
│   │   ├── themed-view/     # Theme-aware container views
│   │   └── ui/              # UI widgets (e.g. collapsible sections)
│   │
│   ├── constants/           # Global design tokens (theme Colors, fonts) and API endpoints
│   ├── hooks/               # Custom React hooks (useTheme)
│   └── utils/               # Helper utilities (encrypted storage wrappers)
```

---

## Getting Started

### 1. Prerequisites
Ensure you have Node.js and your preferred package manager (npm, yarn, or pnpm) installed. A local API backend must also be running.

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Start the Development Server
Launch Metro bundler to run on an emulator, simulator, physical device (via Expo Go), or web browser:
```bash
npm run start
```
*Press `i` for iOS Simulator, `a` for Android Emulator, or `w` for Web.*

---

## Code Quality and Verification

We maintain a strict typing and styling convention across the codebase.

### Running the Linter
To identify style violations or syntax anomalies:
```bash
npm run lint
```

### Type Verification
To check type safety and import compliance:
```bash
npx tsc --noEmit
```
