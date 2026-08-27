# The Unmarketing Agency Website

A modern, headless website built with **Next.js 14** and **Sanity CMS**, deployed on **Vercel**. This is the official website for The Unmarketing Agency - a strategy-first branding and design studio with offices in Los Angeles, Singapore, and Mumbai.

## 🚀 Quick Links
- **Live Website**: [https://www.theunmarketing.agency](https://www.theunmarketing.agency)
- **GitHub Repository**: [https://github.com/The-Unmarketing-Agency/theunmarketing.agency](https://github.com/The-Unmarketing-Agency/theunmarketing.agency)
- **Vercel Dashboard**: [https://vercel.com/the-unmarketing-agency/theunmarketing-agency](https://vercel.com/the-unmarketing-agency/theunmarketing-agency)
- **Sanity Studio**: [https://the-unmarketing-agency.sanity.studio](https://the-unmarketing-agency.sanity.studio)

## 🎯 Current Status
**✅ Website**: Live and functional  
**⚠️ JSON-LD**: Fixed in source but needs redeployment  
**📈 SEO**: All meta tags working, structured data pending  

## 🐛 Critical Issue: JSON-LD Bug

### **Problem**
The JSON-LD structured data contains an invalid `@context` URL that breaks all SEO/AEO structured data:

```json
"@context": "https://***@graph"  ❌ WRONG
```

### **Root Cause**
- **Source Code**: Already fixed (`src/lib/structured-data/graph.ts` line 57 shows correct `"https://schema.org"`)
- **Deployed Version**: Still shows broken template placeholder
- **Issue**: Template placeholder `***` wasn't replaced before deployment

### **Solution**
1. ✅ **Source Code Fixed**: Already correct in repository
2. ⏳ **Redeploy Required**: Requires Vercel rebuild to propagate fix
3. 📊 **Verify Post-Deploy**: Use verification script included in `/scripts/verify-jsonld.sh`

### **Verification Commands**
```bash
# Check current live status
curl -s https://www.theunmarketing.agency | grep -o '"@context":"[^"]*"' | head -1

# Detailed verification
./scripts/verify-jsonld.sh
```

## 🛠️ Tech Stack

### **Core Framework**
- **Next.js 14** (App Router, React Server Components, TypeScript)
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **React Server Components** - Performance optimization

### **Headless CMS**
- **Sanity.io** - Content management
- **Sanity Studio** - Content editing interface
- **GROQ** - Query language
- **Image optimization** - Automatic CDN transforms

### **Deployment & Hosting**
- **Vercel** - Hosting & CI/CD
- **Vercel Analytics** - Performance monitoring
- **Vercel Speed Insights** - Performance metrics
- **Custom Domain**: `theunmarketing.agency` with WWW

### **SEO & Optimization**
- **Next.js SEO** - Built-in SEO features
- **Schema.org** - Structured data (⚠️ fix pending)
- **Dynamic Sitemap** - `/api/sitemap`
- **OpenGraph & Twitter Cards** - Social sharing optimized
- **Google Analytics**: `G-9G195FQ34J`

## 📁 Project Structure

```
theunmarketing.agency/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (pages)/           # Route groups
│   │   ├── api/               # API routes (sitemap, etc.)
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── content/           # Content components (JsonLd, UniversalFAQSchema)
│   │   ├── layout/            # Layout components
│   │   └── ui/                # UI components
│   ├── lib/                   # Utilities & helpers
│   │   ├── structured-data/   # JSON-LD schemas (⚠️ source fixed, deploy pending)
│   │   └── sanity/            # Sanity client & queries
├── public/                    # Static assets
├── scripts/                   # Verification scripts
├── .github/workflows/         # GitHub Actions
└── Configuration files        # package.json, tsconfig.json, etc.
```

## 🔧 Development Setup

### **Prerequisites**
1. Node.js 18+ 
2. npm/yarn/pnpm
3. Sanity CLI (`npm install -g @sanity/cli`)

### **Environment Variables**
```bash
# Copy example file
cp .env.example .env.local

# Required variables in .env.local:
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
NEXT_PUBLIC_SITE_URL=https://www.theunmarketing.agency
```

### **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### **Sanity Studio**
```bash
# Access production studio
open https://the-unmarketing-agency.sanity.studio
```

## 🚀 Deployment

### **Vercel Automatic Deployment**
- **Main Branch**: `main` → `https://www.theunmarketing.agency`
- **Preview Deployments**: PRs create preview URLs
- **CI/CD**: Automatic on push to `main`

### **Manual Deployment**
```bash
# Build locally
npm run build

# Deploy to Vercel (if Vercel CLI installed)
vercel --prod
```

### **Pending Deployment Action**
**To fix JSON-LD**:
1. Push any change to `main` branch
2. Or trigger manual redeploy in Vercel dashboard
3. Verify after deploy: `./scripts/verify-jsonld.sh`

## 📊 SEO & Performance

### **Current Status**
| Feature | Status | Notes |
|---------|--------|-------|
| Meta Tags | ✅ | Title, description, keywords |
| OpenGraph/Twitter | ✅ | Images, cards working |
| JSON-LD Schema | ⚠️ | Source fixed, needs redeploy |
| Dynamic Sitemap | ✅ | `/api/sitemap` |
| Robots.txt | ✅ | Properly configured |
| Canonical URLs | ✅ | Implemented |
| Google Analytics | ✅ | G-9G195FQ34J |
| Core Web Vitals | 📊 | Vercel Analytics |

### **Performance Features**
- **Next.js Image Optimization**: Automatic WebP conversion
- **Font Optimization**: Manrope font preloaded with subsetting
- **Code Splitting**: Route-based automatic splitting
- **Edge Caching**: Vercel global edge network
- **Incremental Static Regeneration**: Fast content updates

## 🐛 Known Issues & Fixes

### **Critical (Fix Pending)**
1. **JSON-LD Schema** (`src/lib/structured-data/graph.ts`)
   - **Status**: ✅ Fixed in source, ⏳ pending redeploy
   - **Fix Verification**: Wait for next Vercel deployment
   - **Priority**: HIGH for SEO/AEO

### **Resolved Issues**
1. **DNS Propagation**: ✅ Complete (theunmarketing.agency)
2. **Preview Pane Bug**: ✅ Hermes preview caching resolved
3. **Basic SEO**: ✅ Meta tags, OpenGraph working

## 📈 Monitoring

### **Analytics**
- **Google Analytics**: `G-9G195FQ34J` - Page views, events
- **Vercel Analytics**: Real Experience Scores, Core Web Vitals
- **Vercel Speed Insights**: Performance monitoring

### **Verification Tools**
```bash
# JSON-LD verification script
chmod +x ./scripts/verify-jsonld.sh
./scripts/verify-jsonld.sh

# Google Rich Results Test
open "https://search.google.com/test/rich-results?url=https://www.theunmarketing.agency"

# Schema Validator
open "https://validator.schema.org/#url=https%3A%2F%2Fwww.theunmarketing.agency"
```

## 🔐 Security

### **Implemented Measures**
- **HTTPS**: Enforced via Vercel
- **Security Headers**: CSP, XSS protection
- **Rate Limiting**: API route protection
- **Environment Variables**: Secured via Vercel
- **GitHub Security**: Dependabot, code scanning enabled

### **Credentials Management**
- All API keys in Vercel environment variables
- Sanity tokens managed via Sanity dashboard
- `.env.local` gitignored for local development

## 🤝 Contributing

### **Git Workflow**
1. **Branch**: Create feature branch from `main`
2. **Develop**: Make changes with descriptive commits
3. **Test**: Verify locally (`npm run dev`)
4. **PR**: Create pull request to `main`
5. **Review**: Code review required
6. **Merge**: Squash and merge after approval

### **Commit Convention**
```bash
feat: add new service page
fix: resolve JSON-LD schema issue
docs: update README with setup instructions
style: update button styling
refactor: improve component structure
chore: update dependencies
```

## 📞 Support & Contact

### **Development Issues**
1. Check existing GitHub issues
2. Review documentation in this README
3. Contact maintainers for critical issues

### **Website Issues**
- **Content Updates**: Use Sanity Studio
- **Technical Issues**: Create GitHub issue
- **Urgent Problems**: Contact technical team

### **Maintainers**
- **Gladwyn Lewis** - [`@gladwynunmarketing`](https://github.com/gladwynunmarketing)
- **Repository Admin**: [`@The-Unmarketing-Agency`](https://github.com/The-Unmarketing-Agency)

## 📚 Documentation Links

### **External Resources**
- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Schema.org Reference](https://schema.org/docs/documents.html)

### **Internal Documentation**
- **JSON-LD Implementation**: See `src/lib/structured-data/`
- **Component Structure**: See `src/components/`
- **API Routes**: See `src/app/api/`

## 📄 License & Rights

All rights reserved. The Unmarketing Agency © 2026

---

**Repository**: The-Unmarketing-Agency/theunmarketing.agency  
**Live Website**: https://www.theunmarketing.agency  
**Last Updated**: August 28, 2026 (GitHub Actions fix applied)  
**Version**: 1.0.0  
**Maintainer**: Gladwyn Lewis  
**Status**: ✅ Production (GitHub Secrets configured for all required APIs)