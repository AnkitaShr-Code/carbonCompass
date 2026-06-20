# 🧭 CarbonCompass

CarbonCompass is an AI-powered sustainability coach and carbon footprint awareness platform designed to help users track, understand, and lower their carbon emissions.

## 🚀 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (dark mode enabled)
- **Icons**: Lucide React
- **AI Engine**: Google Gemini API via `@google/generative-ai`
- **Testing**: Vitest

## 📁 Project Structure

```
carboncompass/
├── app/
│   ├── layout.tsx            # Root layout with metadata, Inter font, dark mode
│   ├── page.tsx              # Landing/home page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard view
│   ├── tracker/
│   │   └── page.tsx          # Activity logging form
│   ├── insights/
│   │   └── page.tsx          # AI assistant insights
│   ├── goals/
│   │   └── page.tsx          # Goals and achievements
│   ├── profile/
│   │   └── page.tsx          # Profile setup placeholder
│   └── api/
│       └── insights/
│           └── route.ts      # Server-side Gemini API route
├── components/
│   ├── ui/                   # Reusable UI primitives (Button, Card, Input, Badge)
│   ├── layout/               # Navbar, Footer
│   ├── onboarding/           # Onboarding flow placeholder (.gitkeep)
│   ├── tracker/              # Tracker form components
│   ├── dashboard/            # Chart components
│   └── insights/             # AI chat components
├── lib/
│   ├── carbonUtils.ts        # CO₂ calculation engine
│   ├── emissionFactors.ts    # Frozen emission constants
│   ├── sanitize.ts           # Input validation & sanitization
│   ├── storage.ts            # localStorage wrapper with error handling
│   ├── mockData.ts           # Mock data placeholder
│   ├── badgeUtils.ts         # Badge achievements placeholder
│   └── types.ts              # All TypeScript interfaces
├── hooks/
│   ├── useCarbonTracker.ts   # Tracker form state hook
│   └── useAssistant.ts       # AI chat state hook
├── __tests__/
│   ├── carbonUtils.test.ts   # Unit tests for calculation logic
│   └── sanitize.test.ts      # Unit tests for validation
├── .gitignore
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🛠️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4. **Run Unit Tests**:
   ```bash
   npm run test
   ```

5. **Run Coverage Reports**:
   ```bash
   npm run coverage
   ```
