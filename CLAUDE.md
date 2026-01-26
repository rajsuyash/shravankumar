# CLAUDE.md - AI Assistant Guide

## Project Overview

**Shravan Kumar** is a premium pilgrimage marketplace web application designed to facilitate safe pilgrimages for senior citizens. The platform connects families with pilgrimage services that include real-time medical monitoring, verified companions, and seamless logistics.

The name "Shravan Kumar" references the legendary devoted son from Hindu mythology who carried his blind parents on a pilgrimage.

## Tech Stack

- **Frontend**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4 with custom theme
- **Backend/Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router DOM 7.x
- **Icons**: Lucide React + Material Symbols
- **Date Handling**: date-fns

## Directory Structure

```
shravankumar/
├── src/
│   ├── components/
│   │   ├── coordinator/      # Coordinator-specific components
│   │   ├── layout/           # Header, Footer
│   │   └── ui/               # Reusable UI components (Button, Badge, Icon, etc.)
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.tsx   # Authentication state & methods
│   │   └── BookingContext.tsx # Booking flow state management
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client initialization
│   │   └── imageUpload.ts    # Image upload utilities
│   ├── pages/                # Route page components
│   ├── types/
│   │   └── database.ts       # TypeScript interfaces for DB entities
│   ├── App.tsx               # Main app with routing
│   ├── main.tsx              # React entry point
│   └── index.css             # Global styles & Tailwind config
├── supabase/
│   └── migrations/           # SQL migration files (chronologically ordered)
├── public/                   # Static assets
├── index.html                # HTML entry point
└── [config files]            # Vite, TypeScript, Tailwind, ESLint configs
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Run TypeScript type checking
npm run typecheck

# Deploy to GitHub Pages
npm run deploy
```

## Environment Variables

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: The `.env` file is gitignored. Never commit credentials.

## Key Conventions

### Component Patterns

1. **Functional components with TypeScript**:
   ```tsx
   interface ComponentProps {
     prop1: string;
     prop2?: number;
   }

   export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
     // component logic
   };
   ```

2. **Named exports** for all components (not default exports)

3. **UI components** in `src/components/ui/` with barrel exports via `index.ts`

4. **Page components** in `src/pages/` follow the pattern `*Page.tsx`

### Styling Conventions

1. **Tailwind CSS** for all styling - no separate CSS files per component

2. **Custom theme colors**:
   - `primary`: `#d15400` (orange)
   - `background-light`: `#f8f7f5`
   - `background-dark`: `#23170f`
   - `ivory-dark`: `#eceae5`

3. **Font**: Lexend (Google Font) loaded in `index.html`

4. **Button variants**: `primary`, `secondary`, `outline`, `ghost`

5. **Border color standard**: `border-[#e7dfda]`

### Authentication Patterns

1. Use `useAuth()` hook from `AuthContext` to access:
   - `user` - Supabase user object
   - `userProfile` - Custom user profile from `users` table
   - `isAdmin` - Boolean for admin role check
   - `signIn`, `signUp`, `signOut`, `signInWithGoogle` - Auth methods

2. **Protected routes** use `<ProtectedRoute>` wrapper:
   ```tsx
   <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
   ```

3. **User types**: `pilgrim`, `coordinator`, `medical`, `admin`

### Database Conventions

1. **UUIDs** for all primary keys
2. **JSONB** for arrays and nested objects (e.g., `traveler_details`, `itinerary`)
3. **Row Level Security (RLS)** enabled on all tables
4. **Timestamps**: `created_at` and `updated_at` with auto-update triggers
5. **Soft status fields** instead of hard deletes (e.g., `is_active`, `booking_status`)

### Supabase Query Patterns

```tsx
// Fetching data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)
  .order('column', { ascending: true });

// Insert
const { data, error } = await supabase
  .from('table_name')
  .insert({ column: value })
  .select()
  .single();

// Update
const { error } = await supabase
  .from('table_name')
  .update({ column: value })
  .eq('id', id);
```

## Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (customers, pilgrims, staff, admin, medical_team) |
| `circuits` | Pilgrimage tour packages with itinerary, pricing, services |
| `bookings` | Tour bookings with traveler details and status |
| `medical_assessments` | Pre-trip health assessments for pilgrims |
| `trips` | Actual tour executions with coordinator and doctor assignments |
| `trip_daily_updates` | Daily updates and photos during trips |
| `payments` | Payment transactions (Razorpay integration) |
| `reviews` | Customer reviews and ratings |
| `emergency_contacts` | Emergency contact information per booking |

### Key Relationships

- `bookings` → `users` (customer_id, pilgrim_id)
- `bookings` → `circuits` (circuit_id)
- `trips` → `circuits`, `users` (coordinator, doctor)
- `medical_assessments` → `bookings`, `users`

## Application Routes

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | HomePage | No | Landing page with featured circuits |
| `/login` | LoginPage | No | Authentication page |
| `/circuits` | CircuitsPage | No | Browse all pilgrimage circuits |
| `/circuits/:id` | CircuitDetailPage | No | Circuit details and booking |
| `/booking/new` | BookingPage | No | Start booking flow |
| `/booking/medical-assessment` | MedicalAssessmentPage | No | Medical form for travelers |
| `/booking/payment` | PaymentPage | No | Payment processing |
| `/booking/confirmation` | BookingConfirmationPage | No | Booking confirmation |
| `/dashboard` | DashboardPage | Yes | User dashboard |
| `/messages` | MessagingPage | Yes | In-app messaging |
| `/coordinator` | CoordinatorDashboard | Yes | Coordinator management |
| `/medical` | MedicalTeamDashboard | Yes | Medical team dashboard |
| `/admin` | AdminDashboard | Yes (admin) | Admin management panel |
| `/trip-updates` | TripUpdatesPage | Yes | View trip updates |
| `/trip-detail` | TripDetailPage | Yes | Trip details |
| `/safety-vows` | SafetyVowsPage | No | Safety commitment page |

## Common Patterns

### Loading States

```tsx
const [loading, setLoading] = useState(true);

// In JSX
{loading ? (
  <div className="animate-pulse bg-white rounded-lg h-96"></div>
) : (
  <ActualContent />
)}
```

### Error Handling

```tsx
try {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  setData(data);
} catch (error) {
  console.error('Error:', error);
} finally {
  setLoading(false);
}
```

### Icon Usage

Use the `Icon` component for Material Symbols:
```tsx
<Icon name="health_and_safety" className="text-4xl text-primary" />
```

## Testing Considerations

- No test framework currently configured
- Consider adding Vitest for unit tests
- Components are designed for testability with clear prop interfaces

## Deployment

- **Vercel**: Primary deployment target (configured via `public/_redirects`)
- **GitHub Pages**: Alternative deployment via `npm run deploy`
- SPA routing handled via `public/404.html` redirect

## Important Notes for AI Assistants

1. **Always use TypeScript** - maintain type safety throughout
2. **Follow existing patterns** - check similar components before creating new ones
3. **Supabase RLS** - new tables need proper RLS policies
4. **No inline styles** - use Tailwind classes exclusively
5. **Form validation** - use Zod schemas with react-hook-form
6. **State management** - use React Context for global state, local state for component-specific data
7. **Responsive design** - all components should work on mobile (mobile-first approach)
8. **Accessibility** - ensure proper ARIA labels and keyboard navigation
9. **Environment variables** - all Supabase config uses `VITE_` prefix for Vite
10. **Migration files** - new DB changes need timestamped migration files in `supabase/migrations/`
