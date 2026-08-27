export type Slug = { current?: string };

export type SanityReference = {
  _key?: string;
  _ref?: string;
  _type?: "reference";
};

export type SanityColor =
  | string
  | {
      _type?: string;
      hex?: string;
      alpha?: number;
      hsl?: {
        _type?: string;
        h?: number;
        s?: number;
        l?: number;
        a?: number;
      };
      hsv?: {
        _type?: string;
        h?: number;
        s?: number;
        v?: number;
        a?: number;
      };
      rgb?: {
        _type?: string;
        r?: number;
        g?: number;
        b?: number;
        a?: number;
      };
    };

export type SanityImage = {
  _key?: string;
  _type?: "image";
  alt?: string;
  caption?: string;
  backgroundColor?: SanityColor;
  asset?: SanityReference & {
    url?: string;
    metadata?: {
      dimensions?: { width?: number; height?: number; aspectRatio?: number };
      lqip?: string;
    };
  };
  crop?: { top?: number; bottom?: number; left?: number; right?: number };
  hotspot?: { x?: number; y?: number; height?: number; width?: number };
};

export type PortableTextValue = Array<Record<string, unknown>>;

export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: SanityImage;
  noIndex?: boolean;
};

export type Faq = {
  _id: string;
  question?: string;
  answer?: string;
  sortOrder?: number;
  slug?: Slug;
};

export type Service = {
  _id: string;
  title: string;
  slug?: Slug;
  description?: string;
};

export type Author = {
  _id: string;
  _updatedAt?: string;
  name: string;
  role?: string;
  slug?: Slug;
  bio?: string;
  image?: SanityImage;
  linkedin?: string;
};

export type ThoughtCategory = {
  _id: string;
  title: string;
  slug?: Slug;
  description?: string;
  headerTextColor?: string;
};

export type Pillar = {
  _id: string;
  title: string;
  slug?: Slug;
  thesis?: string;
};

export type WorkSummary = {
  _id: string;
  _updatedAt?: string;
  title: string;
  slug?: Slug;
  tagline?: string;
  industry?: string;
  mainImage?: SanityImage;
  clientLogo?: SanityImage;
  services?: Service[];
  featuredProject?: boolean;
};

export type ImpactStat = {
  _key?: string;
  value?: string;
  label?: string;
};

export type VideoEmbed = {
  _key?: string;
  kind?: string;
  url?: string;
};

export type Work = WorkSummary & {
  gallery?: SanityImage[];
  theBrief?: PortableTextValue;
  ourSolution?: PortableTextValue;
  projectDetails?: PortableTextValue;
  impactStats?: ImpactStat[];
  videoEmbeds?: VideoEmbed[];
  audience?: string;
};

export type ThoughtSummary = {
  _id: string;
  _updatedAt?: string;
  title: string;
  slug?: Slug;
  bluf?: string;
  featuredImage?: SanityImage;
  publishedAt?: string;
  author?: Author;
  categories?: ThoughtCategory[];
  pillar?: Pillar;
  seo?: SeoFields;
  titleColor?: SanityColor;
  backgroundColor?: SanityColor;
  showcase?: string[];
};

export type Thought = ThoughtSummary & {
  body?: PortableTextValue;
  faqs?: Faq[];
  showFaq?: boolean;
  relatedThoughts?: ThoughtSummary[];
};

export type PageDocument = {
  _id: string;
  _updatedAt?: string;
  _type: "page";
  title: string;
  slug?: Slug;
  isHomepage?: boolean;
  heroH1?: string;
  heroH2?: PortableTextValue;
  heroH2a?: string;
  heroH2b?: string;
  heroText?: PortableTextValue;
  body?: PortableTextValue;
  pageTitleH2?: string;
  sectionGroupH2?: string;
  ethosH2?: string;
  ethosH3?: string;
  servicesH4?: string;
  section1H3?: string;
  section1H4?: string;
  section1Text?: string;
  section2H3?: string;
  section2H4?: string;
  section2Text?: string;
  section3H3?: string;
  section3H4?: string;
  section3Text?: string;
  section4H3?: string;
  section4H4?: string;
  section4Text?: string;
  section5H3?: string;
  section5H4?: string;
  section5Text?: string;
  section1CaseStudyLogo?: CaseStudyLogo;
  section2CaseStudyLogo?: CaseStudyLogo;
  section3CaseStudyLogo?: CaseStudyLogo;
  section4CaseStudyLogo?: CaseStudyLogo;
  section5CaseStudyLogo?: CaseStudyLogo;
  featuredWork?: WorkSummary[];
  clientLogos?: SanityImage[];
  faqs?: Faq[];
  showFaq?: boolean;
  seo?: SeoFields;
};

export type CaseStudyLogo = SanityImage & {
  workPage?: {
    slug?: Slug;
    title?: string;
  };
};

export type LandingPage = {
  _id: string;
  _updatedAt?: string;
  _type: "landingPage";
  title: string;
  slug?: Slug;
  heroH1?: string;
  heroH2?: string;
  introText?: string | PortableTextValue;
  featuredWork?: WorkSummary[];
  showreelVideo?: string;
  contactH2?: string;
  contactText?: string;
  showFaq?: boolean;
  faqs?: Faq[];
  seo?: SeoFields;
};

export type Ebook = {
  _id: string;
  _updatedAt?: string;
  title: string;
  slug?: Slug;
  subheading?: string;
  description?: string;
  coverImage?: SanityImage;
  previewTitle?: string;
  previewText?: string;
  downloadFile?: {
    asset?: SanityReference & {
      url?: string;
      originalFilename?: string;
      mimeType?: string;
    };
  };
  pdfFile?: {
    asset?: SanityReference & {
      url?: string;
      originalFilename?: string;
      mimeType?: string;
    };
  };
  downloadLink?: string;
  seo?: SeoFields;
};

export type SitemapContent = {
  pages: Array<{ slug?: string; isHomepage?: boolean; updatedAt?: string }>;
  landingPages: Array<{ slug?: string; updatedAt?: string }>;
  thoughts: Array<{ slug?: string; updatedAt?: string }>;
  works: Array<{ slug?: string; updatedAt?: string }>;
  authors: Array<{ slug?: string; updatedAt?: string }>;
  categories: Array<{ slug?: string; updatedAt?: string }>;
  ebooks: Array<{ slug?: string; updatedAt?: string }>;
};
