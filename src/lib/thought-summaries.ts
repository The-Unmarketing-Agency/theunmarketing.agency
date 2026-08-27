/**
 * Canonical Webflow post summaries for thoughts / blog collection.
 * On Webflow (https://unmagency.webflow.io/thoughts), thought cards and
 * article meta descriptions use concise editorial summaries, whereas
 * Sanity CMS bluf fields contain dense multi-sentence essays.
 */
export const WEBFLOW_THOUGHT_SUMMARIES: Record<string, string> = {
  "how-apple-uses-pablo-picasso-s-bull-to-teach-innovation":
    "Pablo Picasso's \"Bull\" series, a collection of 11 lithographs created in 1945, offers a fascinating exploration of artistic simplification...",
  "building-a-formidable-brand-community":
    "Brand communities exist to serve their members, not the brand. Give up tight control & nurture the community to allow it to thrive...",
  "should-i-use-ai-for-branding":
    "AI has a place in branding work. Deciding what your brand means isn't it. Here's where we draw the line, and where you safely can too.",
  "ai-logo-generator-vs-branding-agency":
    "AI logo generators are fast and cheap. Here's what you actually lose when you skip a branding agency, and when the trade-off is worth it.",
  "building-a-strong-community-in-the-age-of-digital-overload":
    "Build real community: engage, value, connect. Skip noise, be authentic, consistent. Foster belonging, not just followers, through human connections. Austin Mathews, takes you through the art of building a strong community...",
  "a-foray-into-the-world-of-flat-design":
    "Flat design is gaining popularity! Learn why brands are ditching skeuomorphism for a minimalist aesthetic in this blog article.",
  "marketing-dos-and-don-ts":
    "Marketing can make or break your business. Navigate the maze with our expert dos and don'ts for impactful campaigns...",
  "tech-and-its-cults-of-personalities":
    "FTX's downfall: A cautionary tale of tech's obsession with founder cults. Marketing hype & celebrity endorsements masked a house of cards, that eventually unravelled...",
  "from-the-worst-to-the-best-commercial-in-the-world":
    "Apple's 1984 ad, with its bold imagery and defiant message, positioned them as rebels, challenging conformity and igniting consumer passion...",
  "ads-that-celebrate-women":
    "Beyond stereotypes, these ads celebrate women's strength, resilience, and achievements...",
  "why-design-thinking-is-a-lifeline-to-our-world":
    "Design thinking's human-centered approach solves complex problems with empathy and creativity, driving innovation for a better future...",
  "advertising-awards-are-stupid-but-they-are-also-necessary":
    "Do awards prioritize creativity over effectiveness? We question cost, bias, and relevance to real-world marketing...",
  "left-brain-vs-right-brain":
    "While both sides of the brain work together, they have different strengths. We explore the difference between Left & Right Brain thinking",
  "marketing-campaigns-that-did-it-right":
    "Human-centric advertising resonates because it mirrors our experiences, emotions, and aspirations...",
  "ads-are-so-wrong":
    "Advertising triggers dopamine release with enticing visuals and promises, creating a cycle of desire and reward-seeking...",
  "branding-in-motion-life-in-movement":
    "Motion design captivates audiences with dynamic visuals, boosting engagement and conveying messages with impact...",
  "your-identity-how-deep-it-goes-and-why-it-matters":
    "You inner being is crucial to almost everything about you. It’s what defines you; it’s your identity. This time around, I’m going a bit deeper...",
  "beyond-the-journey-of-branding":
    "The journey of any branding exercise will lead you towards a clear understanding of the personality, values & purpose, tone, messaging and so much more...",
  "branding-v-s-marketing":
    "Branding builds identity and trust. Marketing promotes products and drives sales. Are both vital for success?",
  "the-greys-in-branding":
    "Branding isn't black and white. Ethical dilemmas, cultural sensitivity, and authenticity are ongoing challenges...",
  "why-is-branding-more-than-just-your-logo":
    "Imagine if someone comes up to you at a party, and asks you how or what do you identify yourself as? What would be your answer?",
  "employer-branding-the-power-of-people":
    "Employer branding attracts top talent, boosts employee morale, and improves retention. But is it all that?",
  "as-a-digital-marketing-agency-we-are-idea-farmers":
    "A Digital Marketing Agency is hired for it’s innovation, and not to pander to conservative, tried and tested methods...",
  "why-the-elon-musk-bid-for-twitter":
    "Elon Musk's acquisition of Twitter, while controversial, but it has the potential for positive outcomes...",
  "audio-your-brands-superpower":
    "Sonic branding is crucial for brand recognition and differentiation in today's crowded market...",
  "dune-a-masterpiece-in-sonic-experiences":
    "Hans Zimmer's score elevates the film to another level, using unique instruments and unconventional sounds to create an otherworldly atmosphere...",
  "how-centerstage-should-your-sonic-branding-be":
    "Sonic branding deserves a central role in brand identity because it creates a powerful, multi-sensory experience...",
  "submerged-in-air-immersed-in-sound":
    "Sound adds depth and emotion to stories, enhancing immersion and creating memorable experiences...",
  "the-ultimate-guide-to-storytelling-in-advertising":
    "Storytelling in advertising captivates audiences by connecting with them on an emotional level. How can you unleash this superpower?",
  "brand-storytelling":
    "Relatable narratives humanize brands, build trust, and make them memorable. That's Storytelling in a nutshell...",
  "the-story-and-its-telling":
    "Stories reflect our joys, sorrows, and struggles, creating connections that transcend time and culture...",
  "storytelling-the-gift-of-knowledge":
    "Stories make complex information engaging and memorable, aiding comprehension and knowledge retention...",
  "market-research-sucks-but-it-doesn-t-have-to-be":
    "Market research provides crucial insights into customer needs, preferences, and behaviors, guiding effective strategies...",
  "ux-u-is-for-users-in-and-beyond-the-digital-realm":
    "Global competition and the digital age have put severe importance on the user’s experience. It has become one of the ways a brand can stand out...",
  "what-is-a-hamburger-menu-and-should-you-use-it":
    "That little three-lined button is a fairly well used trend, in a lot of today's websites. But is it really necessary?",
  "what-is-user-experience":
    "Good UX leads to satisfied users who are more likely to engage, convert, and become loyal customers...",
  "gaming-and-stepping-to-the-new-web":
    "Gaming offers immersive experiences, blurring lines between virtual and real. But is it really that powerful?",
  "branding-and-user-experience-same-sides-of-the-same-coin":
    "Branding shapes perception, UX shapes interaction. Both are essential for a cohesive, impactful brand experience...",
  "making-user-experience-go-viral":
    "Craft exceptional UX that delights users, exceeding expectations. Encourage sharing with seamless social integration...",
};

export function getThoughtSummary(slug?: string, fallback?: string): string {
  if (!slug) return fallback || "";
  return WEBFLOW_THOUGHT_SUMMARIES[slug] || fallback || "";
}

/**
 * Webflow animated assets that were degraded to static frames during Sanity CMS migration.
 */
export const WEBFLOW_ANIMATED_THOUGHT_ASSETS: Record<string, string> = {
  "should-i-use-ai-for-branding": "/media/thought-previews/should-i-use-ai-for-branding.webp",
};

export function getThoughtAnimatedAsset(slug?: string): string | null {
  if (!slug) return null;
  return WEBFLOW_ANIMATED_THOUGHT_ASSETS[slug] || null;
}
