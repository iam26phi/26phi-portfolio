# 26phi Photography Portfolio

A minimalist, brutalist-inspired photography portfolio website for photographer 26phi, featuring dynamic photo management, category filtering, and an admin dashboard.

## Features

### Public-Facing Features
- **Hero Section**: Bold typography with photographer's motto and background imagery
- **Portfolio Gallery**: Masonry-style photo grid with 12+ works
- **Category Filtering**: Filter by Portrait, Travel, and Editorial categories
- **Lightbox View**: Full-screen photo viewer with keyboard/swipe navigation
- **Client Testimonials**: Social proof section with client reviews
- **About Page**: Photographer biography and philosophy
- **Responsive Design**: Mobile-first design with touch gesture support

### Admin Features
- **Photo Management Dashboard**: Full CRUD operations for portfolio photos
- **Visibility Control**: Show/hide photos without deletion
- **Metadata Editing**: Update titles, descriptions, locations, and dates
- **Category Management**: Organize photos by category
- **Sort Order Control**: Manual ordering of photos in the gallery
- **Authentication**: Secure admin access with OAuth integration

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Wouter** for client-side routing
- **shadcn/ui** component library
- **tRPC** for type-safe API calls

### Backend
- **Express.js** server
- **MySQL** database via Drizzle ORM
- **tRPC** for API layer
- **JWT** authentication
- **OAuth** integration

## Getting Started

### Prerequisites
- Node.js 22.x or higher
- pnpm package manager
- MySQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/26phi_portfolio.git
cd 26phi_portfolio
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your MySQL connection string
- `JWT_SECRET`: Random secret for JWT signing
- `OAUTH_SERVER_URL`: OAuth provider URL
- `OWNER_OPEN_ID`: Your OpenID for admin access

4. Run database migrations:
```bash
pnpm db:push
```

5. (Optional) Seed initial photo data:
```bash
pnpm exec tsx migrate-photos.mjs
```

6. Start the development server:
```bash
pnpm dev
```

The site will be available at `http://localhost:3000`

## Project Structure

```
26phi_portfolio/
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   │   └── images/        # Photo files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Home, About, Admin)
│   │   ├── lib/           # Utilities and helpers
│   │   └── contexts/      # React contexts
├── server/                # Backend application
│   ├── _core/            # Core server utilities
│   ├── routers.ts        # tRPC route definitions
│   └── db.ts             # Database queries
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Table definitions
└── shared/               # Shared types and constants
```

## Usage

### Admin Dashboard

1. Navigate to `/admin`
2. Log in with your OAuth credentials
3. Manage photos:
   - **Add**: Click "新增照片" to upload new photos
   - **Edit**: Click the edit icon to modify photo details
   - **Toggle Visibility**: Click the eye icon to show/hide photos
   - **Delete**: Click the trash icon to remove photos

### Photo Management

Photos are stored in `client/public/images/portfolio/` organized by category:
- `portrait/` - Portrait photography
- `travel/` - Travel photography
- `editorial/` - Editorial photography

To add new photos:
1. Place image files in the appropriate category folder
2. Use the admin dashboard to create database entries
3. Photos will automatically appear in the gallery

## Deployment

### Manus Platform (Recommended)

This project is optimized for deployment on Manus:

1. Click the "Publish" button in the Manus UI
2. Configure your custom domain (optional)
3. Your site will be live with automatic SSL

### Manual Deployment

For deployment to other platforms:

1. Build the project:
```bash
pnpm build
```

2. Set production environment variables

3. Start the production server:
```bash
pnpm start
```

### Environment Variables

Required environment variables for production:

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://your-oauth-provider.com
OWNER_OPEN_ID=your-openid
NODE_ENV=production
```

## Design Philosophy

The website embodies **Brutalist Minimalism (Mono-Brutalism)** with these principles:

- **Raw Authenticity**: Bold use of space and contrast reflecting the motto "Living itself is a havoc"
- **Structural Tension**: Asymmetric layouts creating visual tension
- **Content-First**: Interface recedes, letting photography take center stage
- **Directness**: No decorative elements, sharp and direct interactions

### Typography
- **Space Grotesk**: Display and headings
- **JetBrains Mono**: Monospace accents and metadata

### Color Palette
- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Accent**: Neutral grays for hierarchy

## Contributing

This is a personal portfolio project. If you find bugs or have suggestions, please open an issue.

## License

MIT License - feel free to use this as a template for your own portfolio.

## Credits

- **Photography**: 26phi
- **Design & Development**: Built with Manus AI
- **Fonts**: Space Grotesk, JetBrains Mono (Google Fonts)

## Contact

For inquiries about photography services, please use the contact form on the website or email directly.

---

Built with ❤️ using Manus AI
