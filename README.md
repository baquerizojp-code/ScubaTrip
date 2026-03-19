# ScubaTrip

A modern platform for managing scuba diving trips, bookings, and dive centers.

## Technologies

- **Frontend**: React with Vite
- **Styling**: Tailwind CSS & shadcn/ui
- **Backend**: Supabase (Authentication & PostgreSQL Database)
- **State Management**: React Query & Zustand
- **Internationalization**: Custom i18n implementation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd ScubaTrip
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Application pages and route components.
- `src/contexts`: React contexts for global state (e.g., Auth).
- `src/integrations`: Supabase client and types.
- `src/lib`: Utility functions and i18n configuration.

## Deployment

The application can be deployed to any static site hosting provider (Vercel, Netlify, GitHub Pages, etc.) by connecting your repository and setting the build command to `npm run build` and the output directory to `dist`.
