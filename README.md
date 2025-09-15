# HR CV Automation Cloud

🚀 **AI-Powered CV Processing & Candidate Management System**

A modern, cloud-based HR automation platform that streamlines CV processing, candidate management, and semantic search using AI technologies.

## 🌟 Features

### Core Functionality
- **📄 CV Upload & Processing**: Drag-and-drop CV upload with automatic PDF parsing
- **🤖 AI-Powered Extraction**: Intelligent extraction of candidate information using OpenAI GPT models
- **🔍 Semantic Search**: Advanced AI-powered candidate search capabilities
- **📊 Candidate Dashboard**: Modern, responsive interface for managing CV profiles
- **🗑️ CRUD Operations**: Complete Create, Read, Update, Delete functionality for CV records
- **☁️ Cloud Storage**: Secure file storage using Supabase Storage

### Technical Features
- **🎨 Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **🌙 Dark/Light Mode**: Theme switching with next-themes
- **📱 Responsive Design**: Mobile-first, fully responsive interface
- **⚡ Real-time Updates**: Live data synchronization
- **🔒 Secure Storage**: Supabase integration for database and file storage

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 15 with Turbopack
- **UI Library**: React 19 with Tailwind CSS 4
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

### AI/Automation Stack
- **Workflow Engine**: n8n for automation workflows
- **AI Models**: OpenAI GPT-4 for CV parsing and analysis
- **Vector Database**: Qdrant for semantic search
- **Document Processing**: PDF text extraction and parsing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- n8n instance (for AI workflows)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HR-CV-automation-cloud
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` in the frontend directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Create a Supabase project
   - Set up the `cv_profiles` table with the following schema:
   ```sql
   CREATE TABLE cv_profiles (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     file_url TEXT,
     skills JSONB,
     experience JSONB,
     education JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Storage Setup**
   - Create a `CVs` bucket in Supabase Storage
   - Set appropriate RLS policies

6. **Run the application**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`

## 🔧 Configuration

### n8n Workflow Setup
The project includes n8n automation workflows (`n8n.json`) for:
- CV processing and AI extraction
- Semantic search functionality
- Database operations



### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Custom Supabase URL for file operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📁 Project Structure

```
HR-CV-automation-cloud/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/candidates/     # API routes
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   └── layout.tsx         # App layout
│   │   ├── components/
│   │   │   ├── ui/                # Reusable UI components
│   │   │   └── upload-modal.tsx   # CV upload modal
│   │   └── lib/
│   │       └── supabase.ts        # Supabase client
│   ├── public/                    # Static assets
│   ├── n8n.json                  # n8n workflow configuration
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Candidates API
- `GET /api/candidates` - Fetch all CV profiles
- `DELETE /api/candidates/[id]` - Delete CV profile and associated file
- `POST /api/search` - Semantic search (via n8n webhook)

## 🎯 Usage

### Uploading CVs
1. Click "Upload CV" button
2. Select PDF file(s)
3. Files are automatically processed using AI
4. Extracted information appears in the dashboard

### Viewing CVs
- Click the "View candidate" (👁️) button to open CV in new tab
- CVs are served directly from Supabase Storage

### Deleting CVs
- Click the "Delete candidate" (🗑️) button
- Confirms deletion and removes both database record and file

### Searching Candidates
- Use the search bar for AI-powered semantic search
- Search by skills, experience, education, or any CV content

## 🔒 Security Considerations

### n8n Webhooks
- **Issue**: Webhook URLs are exposed in the repository
- **Risk Level**: Medium - URLs could be used to trigger workflows
- **Mitigation**: 
  - Regenerate webhook URLs for production
  - Implement webhook authentication
  - Use environment variables for sensitive endpoints
  - Consider moving n8n.json to private configuration

### Best Practices
- Never commit actual API keys or secrets
- Use environment variables for all sensitive configuration
- Implement proper RLS policies in Supabase
- Regularly rotate webhook URLs and API keys

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs` (if available)
- Review the Supabase and n8n documentation

## 🔄 Changelog

### v0.1.0 (Current)
- ✅ Initial release
- ✅ CV upload and processing
- ✅ AI-powered extraction
- ✅ Semantic search
- ✅ CRUD operations
- ✅ Modern UI with dark/light mode

---

**Built with ❤️ using Next.js, Qdrant ,Supabase, and n8n**