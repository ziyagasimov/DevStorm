# Commas — Community Builder Platform

A comprehensive platform for building and growing communities by connecting organizers with speakers, mentors, catering services, and other communities.

## 🌟 Features

### Multi-Role Authentication System
- **5 distinct user roles**: User, Speaker, Mentor, Catering Company, Community Leader
- Role-based registration with dedicated forms for each role
- Role-specific dashboards and navigation
- Powered by Supabase Auth with PostgreSQL triggers for atomic profile creation

### Real-Time Messaging
- Direct messaging between any registered users
- Supabase Realtime subscriptions for instant message delivery
- Conversation management with `create_conversation` RPC for atomic conversation creation
- Input validation with Zod schemas to prevent injection attacks

### AI Community Assistant
- Integrated AI chat powered by external LLM endpoint (FastAPI on Modal)
- Persistent chat history via localStorage
- Markdown rendering for rich AI responses
- Personalized greeting based on user profile

### Role-Specific Dashboards
- **Speaker Dashboard**: Manage expertise, bio, company info
- **Mentor Dashboard**: Track experience, specialization areas
- **Catering Dashboard**: Company profile, services, pricing
- **Community Dashboard**: Event management, leader info

### Directory Pages
- Browse and discover speakers, mentors, catering companies, and communities
- Public profile pages with role-specific information
- Direct messaging from any profile page

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React Query (TanStack Query) for server state
- **Auth & Database**: Supabase (PostgreSQL + Auth + Realtime)
- **AI**: External FastAPI endpoint on Modal
- **Animation**: Framer Motion

### Database Design
```
profiles          — Base user info (all users)
user_roles        — Role assignments (enum: user/speaker/mentor/catering/community)
speaker_profiles  — Speaker-specific data
mentor_profiles   — Mentor-specific data  
catering_profiles — Catering company data
community_profiles — Community organization data
conversations     — Chat conversations
conversation_participants — Many-to-many conversation membership
messages          — Chat messages with realtime subscriptions
```

### Security
- **Row Level Security (RLS)** enabled on all tables
- `SECURITY DEFINER` functions (`has_role`, `get_user_role`, `is_conversation_member`, `create_conversation`) for safe cross-table operations
- Input validation with Zod schemas on all user inputs
- HTML `maxLength` attributes for client-side length limits
- SQL wildcard stripping in search queries

### Key Database Functions
| Function | Purpose |
|---|---|
| `handle_new_user()` | Trigger: creates profile + role + role-specific profile on signup |
| `create_conversation(uuid)` | RPC: atomically creates conversation + participants |
| `get_user_role(uuid)` | RPC: safely fetches user role bypassing RLS |
| `has_role(uuid, role)` | RPC: checks if user has specific role |
| `is_conversation_member(uuid, uuid)` | RPC: validates conversation membership for RLS |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase project (already connected)

### Installation
```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
The project uses Vite environment variables auto-populated from the connected Supabase project:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anonymous/public key
- `VITE_SUPABASE_PROJECT_ID` — Supabase project ID

### Running Tests
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── AppLayout.tsx    # Main layout with sidebar
│   ├── AppSidebar.tsx   # Role-aware navigation sidebar
│   ├── ErrorBoundary.tsx # React error boundary
│   ├── NavLink.tsx      # Active-aware navigation link
│   └── ProtectedRoute.tsx # Auth + role guard
├── contexts/
│   └── AuthContext.tsx   # Global auth state + role management
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client initialization
│       └── types.ts     # Auto-generated database types
├── lib/
│   ├── utils.ts         # Utility functions (cn)
│   └── validation.ts    # Zod validation schemas
├── pages/
│   ├── Index.tsx        # Landing/dashboard page
│   ├── Login.tsx        # Email/password login
│   ├── Signup.tsx       # Multi-role registration
│   ├── Speakers.tsx     # Speaker directory
│   ├── Mentors.tsx      # Mentor directory
│   ├── Catering.tsx     # Catering directory
│   ├── Communities.tsx  # Community directory
│   ├── Messages.tsx     # Real-time messaging
│   ├── AIAssistant.tsx  # AI chat interface
│   ├── PublicProfile.tsx # User profile viewer
│   └── *Dashboard.tsx   # Role-specific dashboards
└── test/
    └── example.test.ts  # Validation schema tests
```

## 🔒 Security Considerations
- All database tables have RLS policies enabled
- User roles stored in separate `user_roles` table (not on profiles)
- `SECURITY DEFINER` functions prevent RLS recursion
- Input validation on both client (Zod + HTML) and server (RLS) sides
- Supabase publishable key is safe to expose (it's a public/anon key)

## 📄 License
This project is proprietary. All rights reserved.
