# JSON-LD Schema Fix Guide

## 🚨 Critical Issue: Broken JSON-LD Schema

### **Problem Summary**
The website's JSON-LD structured data contains an invalid `@context` URL:

```json
{
  "@context": "https://***@graph",  // ❌ INVALID - Should be "https://schema.org"
  "@graph": [...]
}
```

### **Impact**
1. **Search Engine Penalty**: Google, Bing, and other search engines cannot parse the structured data
2. **SEO/AEO Damage**: Missing rich snippets, knowledge panels, and enhanced search results
3. **Broken Pages**: Homepage, About, Services, Work, Thoughts, Contact pages all affected
4. **Priority**: HIGH - Must be fixed immediately

## 🛠️ Root Cause Analysis

### **The Bug**
During the template rendering process, a placeholder `***` wasn't replaced with the correct schema.org URL.

**Current (Broken):**
```javascript
const structuredData = {
  "@context": "https://***@graph",  // Template placeholder not replaced
  "@graph": [...]
};
```

**Correct (Fixed):**
```javascript
const structuredData = {
  "@context": "https://schema.org",  // Correct schema.org URL
  "@graph": [...]
};
```

## 🔧 Fix Implementation

### **Option 1: Quick Template Fix**

Locate the JSON-LD template file (likely in `/app/` or `/components/` directory) and replace:

```javascript
// FIND THIS:
"@context": "https://***@graph"

// REPLACE WITH:
"@context": "https://schema.org"
```

### **Option 2: Complete JSON-LD Structure**

Use this complete, validated JSON-LD structure:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.theunmarketing.agency/#organization",
      "name": "The Unmarketing Agency",
      "legalName": "The Unmarketing Agency Pte. Ltd.",
      "url": "https://www.theunmarketing.agency",
      "description": "Strategy-first branding and design studio in Los Angeles, Singapore, and Mumbai.",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://www.theunmarketing.agency/#organization-logo",
        "url": "https://www.theunmarketing.agency/apple-touch-icon.png",
        "contentUrl": "https://www.theunmarketing.agency/apple-touch-icon.png",
        "caption": "The Unmarketing Agency",
        "width": 512,
        "height": 512
      },
      "image": "https://www.theunmarketing.agency/apple-touch-icon.png",
      "email": "hello@theunmarketing.agency",
      "telephone": "+1-213-555-0100",
      "sameAs": [
        "https://www.linkedin.com/company/theunmarketingagency/",
        "https://www.x.com/theunmarketing",
        "https://www.instagram.com/theunmarketing/",
        "https://vimeo.com/theunmarketingagency"
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "hello@theunmarketing.agency",
          "telephone": "+1-213-555-0100",
          "areaServed": ["Worldwide", "US", "SG", "IN"],
          "availableLanguage": ["English"]
        },
        {
          "@type": "ContactPoint",
          "contactType": "regional office",
          "email": "usa@theunmarketing.agency",
          "areaServed": "US",
          "availableLanguage": ["English"]
        },
        {
          "@type": "ContactPoint",
          "contactType": "regional office",
          "email": "singapore@theunmarketing.agency",
          "areaServed": "SG",
          "availableLanguage": ["English"]
        },
        {
          "@type": "ContactPoint",
          "contactType": "regional office",
          "email": "india@theunmarketing.agency",
          "areaServed": "IN",
          "availableLanguage": ["English"]
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Singapore",
        "addressCountry": "SG"
      },
      "location": [
        {
          "@type": "Place",
          "name": "The Unmarketing Agency — Los Angeles",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Los Angeles",
            "addressRegion": "CA",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 34.0522,
            "longitude": -118.2437
          }
        },
        {
          "@type": "Place",
          "name": "The Unmarketing Agency Pte. Ltd. — Singapore",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Singapore",
            "addressRegion": "Singapore",
            "addressCountry": "SG"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 1.3521,
            "longitude": 103.8198
          }
        },
        {
          "@type": "Place",
          "name": "The Unmarketing Agency — Mumbai",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Mumbai",
            "addressRegion": "MH",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 19.076,
            "longitude": 72.8777
          }
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://www.theunmarketing.agency#webpage",
      "url": "https://www.theunmarketing.agency",
      "name": "Branding Agency | Unmarketing – LA, Singapore & Mumbai",
      "description": "Strategy-first branding and design studio building category-dominating identities, narratives, and sonic architectures on deep human insight.",
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://cdn.sanity.io/images/lozn0fsa/production/4d63489d5bf74f93fd3a5fa5b6129a0db6cbfb7d-2268x1262.jpg?w=1600&q=90&fit=max&auto=format"
      },
      "dateModified": "2026-08-24T07:32:27Z"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.theunmarketing.agency#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.theunmarketing.agency"
        }
      ]
    }
  ]
}
```

### **Option 3: Next.js Component Implementation**

Create a reusable JSON-LD component:

```jsx
// components/seo/StructuredData.jsx
export default function StructuredData({ data }) {
  return (
    <script
      id="page-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          ...data
        }),
      }}
    />
  );
}

// Usage in page components:
import StructuredData from '@/components/seo/StructuredData';

export default function HomePage() {
  const structuredData = {
    "@graph": [
      // Your structured data here
    ]
  };

  return (
    <>
      <Head>
        <StructuredData data={structuredData} />
      </Head>
      {/* Rest of your component */}
    </>
  );
}
```

## ✅ Verification Steps

### **1. Local Testing**
```bash
# Build and test locally
npm run build
npm start

# Check JSON-LD in browser
# 1. Open DevTools (F12)
# 2. Go to Elements tab
# 3. Search for "page-structured-data"
# 4. Verify @context is "https://schema.org"
```

### **2. Online Validation**
Test the fixed JSON-LD with these tools:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/
3. **JSON-LD Playground**: https://json-ld.org/playground/

### **3. Production Verification**
After deployment, verify:

```bash
# Check production JSON-LD
curl -s https://www.theunmarketing.agency | grep -o '"@context":"[^"]*"' | head -1

# Should return:
"@context":"https://schema.org"
```

## 🗺️ File Locations to Check

Based on typical Next.js + Sanity projects, check these files:

1. **`/app/layout.tsx`** - Root layout with structured data
2. **`/components/layout/Header.tsx`** - Header with organization schema
3. **`/lib/seo.ts`** - SEO utility functions
4. **`/app/(pages)/[page]/page.tsx`** - Individual page components
5. **`/components/seo/`** - SEO components directory

## 📈 Expected Benefits After Fix

### **Immediate Improvements**
1. **✅ Valid Structured Data**: Search engines can parse content
2. **✅ Rich Snippets**: Enhanced search results
3. **✅ Knowledge Panels**: Organization info in search
4. **✅ Local SEO**: Location-based search improvements

### **Long-term SEO Benefits**
1. **Better Rankings**: Proper schema helps search understanding
2. **Increased CTR**: Rich snippets improve click-through rates
3. **Voice Search**: Schema helps voice assistant queries
4. **AEO Optimization**: Better answers for AI search tools

## 🚀 Deployment Checklist

1. **✅ Fix Code**: Update JSON-LD template
2. **✅ Test Locally**: Verify fix works in development
3. **✅ Commit Changes**: Use descriptive commit message
   ```
   fix: correct JSON-LD @context URL from *** to schema.org
   ```
4. **✅ Deploy to Vercel**: Push to `main` branch
5. **✅ Verify Production**: Check live site JSON-LD
6. **✅ Submit to Google**: Use Google Search Console to re-crawl

## 🆘 Troubleshooting

### **Common Issues**

**Issue 1: JSON Parse Errors**
```
Error: Unexpected token * in JSON
```
**Solution**: Ensure all `***` placeholders are replaced with `schema.org`

**Issue 2: Schema Validation Errors**
```
@context must be a valid URL
```
**Solution**: Use exact URL `https://schema.org` (not `http://` or trailing slash)

**Issue 3: No Changes After Deployment**
```
Still seeing old JSON-LD
```
**Solution**: 
1. Clear Vercel cache
2. Force revalidation: `npm run build && npm start`
3. Check deployment logs in Vercel dashboard

## 📞 Support

If issues persist after implementing the fix:

1. **Check Logs**: Vercel deployment logs
2. **Validate JSON**: Use JSON validator tools
3. **Contact**: Technical team for assistance

---

**Last Updated**: August 27, 2026  
**Priority**: CRITICAL  
**Status**: READY FOR DEPLOYMENT