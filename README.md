# 🚀 Hank - Personal Portfolio & Blog

A modern, responsive portfolio website with a blog system, built with Next.js, TypeScript, and Tailwind CSS. Features a beautiful purple gradient theme, smooth animations, and a complete admin panel for content management.

![Portfolio Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=Hank+Huge+Portfolio)

## ✨ Features

### 🎨 Design & UX
- **Beautiful Purple Theme**: Consistent indigo-to-purple gradient design throughout
- **Smooth Animations**: Framer Motion powered animations throughout
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: Automatic dark mode detection
- **Glassmorphism Effects**: Modern UI with backdrop blur and transparency

### 📝 Blog System
- **Markdown Support**: Write blog posts in Markdown with syntax highlighting
- **Live Preview**: Preview posts before publishing in the admin panel
- **Tag System**: Organize posts with tags and filter by them
- **Search Functionality**: Search through blog posts by title and content
- **Pagination**: Browse through posts with pagination
- **SEO Optimized**: Meta tags and structured data for better SEO

### 🔐 Admin Panel
- **Authentication**: Secure login system with NextAuth.js
- **Content Management**: Create, edit, publish, and delete blog posts
- **Draft System**: Save posts as drafts and publish later
- **Rich Text Editor**: User-friendly interface for content creation
- **Media Management**: Upload and manage images

### 🛠 Technical Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (easily switchable to PostgreSQL/MySQL)
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Code Highlighting**: React Syntax Highlighter
- **Markdown**: React Markdown

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database with initial data**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Admin Credentials
- **Email**: admin@example.com
- **Password**: admin123

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin panel pages
│   │   ├── api/             # API routes
│   │   ├── blogs/           # Blog pages
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Homepage
│   ├── components/          # Reusable components
│   └── lib/                 # Utility functions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Database seeder
├── public/                 # Static assets
└── package.json
```

## 🎨 Design System

### Color Palette
The portfolio uses a consistent purple gradient theme:
- **Primary**: Indigo to Purple gradients (`from-indigo-600 to-purple-600`)
- **Secondary**: Light purple backgrounds (`from-indigo-50 to-purple-50`)
- **Accent**: Purple highlights and buttons (`from-indigo-500 to-purple-600`)
- **Text**: Indigo for links and interactive elements
- **Borders**: Subtle indigo borders for cards and sections

### Typography
- **Headings**: Bold, gradient text for section titles
- **Body**: Clean, readable text with proper line height
- **Links**: Indigo color with purple hover states

### Components
- **Cards**: White backgrounds with subtle shadows and borders
- **Buttons**: Gradient backgrounds with hover effects
- **Navigation**: Fixed header with backdrop blur
- **Sections**: Alternating light and dark backgrounds

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with initial data
npm run db:push      # Push database schema changes
npm run db:studio    # Open Prisma Studio
```

## 📊 Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile?
  blogs     Blog[]
}
```

### Profile Model
```prisma
model Profile {
  id       String @id @default(cuid())
  bio      String
  title    String
  location String?
  website  String?
  github   String?
  linkedin String?
  twitter  String?
  avatar   String?
  skills   String[] // JSON array
  userId   String   @unique
  user     User     @relation(fields: [userId], references: [id])
}
```

### Blog Model
```prisma
model Blog {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  tags        String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
}
```

## 🌟 Key Features Explained

### Design Philosophy
The portfolio features a clean, professional design with:
- **Consistent Purple Theme**: Beautiful indigo-to-purple gradients throughout
- **Modern UI Elements**: Cards, shadows, and smooth transitions
- **Responsive Layout**: Mobile-first design that works on all devices
- **Accessibility**: Proper contrast ratios and keyboard navigation

### Blog System Architecture
- **Markdown Processing**: Uses React Markdown for content rendering
- **Syntax Highlighting**: React Syntax Highlighter for code blocks
- **Tag Management**: Comma-separated tags with filtering
- **SEO Optimization**: Dynamic meta tags and structured data

### Admin Panel Features
- **Secure Authentication**: NextAuth.js with session management
- **Content Editor**: Rich text editing with Markdown support
- **Preview System**: Live preview of posts before publishing
- **Media Management**: Image upload and management capabilities

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- **Netlify**: Similar to Vercel deployment
- **Railway**: Great for full-stack applications
- **DigitalOcean App Platform**: Scalable hosting solution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Prisma** for the excellent ORM
- **NextAuth.js** for authentication

## 📞 Support

If you have any questions or need help:
- Create an issue in the repository
- Email: hank@example.com
- LinkedIn: [Hank](https://linkedin.com/in/hankhuge)

---

**Built with ❤️ by Hank**
