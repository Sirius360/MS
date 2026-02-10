# Development Setup Guide

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+ (for backend) - **Optional if using mock API**

## Installation

```bash
# Install dependencies
npm install

# Install backend dependencies (if using real backend)
cd server
npm install
cd ..
```

## Running the Application

### Option 1: With Mock API (No Backend Required)

```bash
# Create .env.local file
echo "VITE_USE_MOCK_API=true" > .env.local

# Start development server
npm run dev
```

The app will run at `http://localhost:8080` with mock data.

### Option 2: With Real Backend

```bash
# 1. Start MySQL and create database
# 2. Configure backend .env (see server/README.md)
# 3. Run database migrations
cd server
npm run db:setup
cd ..

# 4. Start backend server (Terminal 1)
npm run server

# 5. Start frontend (Terminal 2)
npm run dev
```

## Environment Variables

Create `.env.local` file in project root:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Mock API (true = use mock data, false = use real backend)
VITE_USE_MOCK_API=false
```

## Available Scripts

### Development

- `npm run dev` - Start Vite dev server (port 8080)
- `npm run server` - Start backend API server (port 3001)
- `npm run server:watch` - Start backend with hot reload

### Code Quality

- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix lint issues
- `npm run typecheck` - Run TypeScript type checking

### Testing

- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report

### Build

- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── shared/              # Shared/reusable code
│   ├── api/            # API client & mock
│   ├── components/     # Reusable components
│   ├── hooks/          # React Query hooks
│   ├── lib/            # Utilities
│   └── types/          # TypeScript types
├── features/           # Feature modules
├── pages/              # Route components
├── components/         # UI components
└── hooks/              # Custom hooks
```

## Mock API

The mock API provides sample data for development:

- 5 products (laptops, phones, accessories)
- 3 customers
- 2 suppliers
- 3 product categories

**Features:**

- Full CRUD operations
- Data persists during session
- Automatically resets on page refresh

## Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## Common Issues

### Port already in use

Frontend (8080) or backend (3001) port in use:

```bash
# Kill processes
taskkill /F /IM node.exe
```

### Mock API not working

Ensure MSW service worker is initialized:

```bash
npx msw init public/ --save
```

### TypeScript errors

Run type checking:

```bash
npm run typecheck
```

## Development Workflow

1. **Start development**

   ```bash
   # With mock API
   VITE_USE_MOCK_API=true npm run dev
   ```

2. **Make changes**
   - Edit code in `src/`
   - Hot reload enabled

3. **Format & lint**

   ```bash
   npm run format
   npm run lint:fix
   ```

4. **Test**

   ```bash
   npm test
   ```

5. **Commit**
   - Pre-commit hooks run automatically
   - Format, lint, typecheck enforced

## Next Steps

- Read `frontend_architecture.md` for architecture details
- Review `frontend_refactor_plan.md` for implementation strategy
- Check `frontend_refactor_walkthrough.md` for progress updates
