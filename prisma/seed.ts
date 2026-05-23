import { PrismaClient } from "@prisma/client";
import { sampleBlogPost, SAMPLE_BLOG_SLUG } from "../src/lib/blog-sample-post";
import { cricketMatchWide, cricketTeamGame } from "../src/lib/remote-images";

const prisma = new PrismaClient();

const defaultTeams = [
  { slug: "outer-delhi-warriors", name: "Outer Delhi Warriors", city: "Outer Delhi", accentColor: "#22c55e", description: "Franchise colours and match-day identity—finalised post trials." },
  { slug: "north-delhi-strikers", name: "North Delhi Strikers", city: "North Delhi", accentColor: "#38bdf8", description: "Franchise colours and match-day identity—finalised post trials." },
  { slug: "south-delhi-royals", name: "South Delhi Royals", city: "South Delhi", accentColor: "#f472b6", description: "Franchise colours and match-day identity—finalised post trials." },
  { slug: "east-delhi-thunder", name: "East Delhi Thunder", city: "East Delhi", accentColor: "#fbbf24", description: "Franchise colours and match-day identity—finalised post trials." },
  { slug: "west-delhi-knights", name: "West Delhi Knights", city: "West Delhi", accentColor: "#a78bfa", description: "Franchise colours and match-day identity—finalised post trials." },
  { slug: "ncr-phoenix", name: "NCR Phoenix", city: "NCR", accentColor: "#fb7185", description: "Franchise colours and match-day identity—finalised post trials." },
  { slug: "yamuna-blazers", name: "Yamuna Blazers", city: "Yamuna Bank", accentColor: "#34d399", description: "Franchise colours and match-day identity—finalised post trials." },
  { slug: "capital-colts", name: "Capital Colts", city: "Central Delhi", accentColor: "#f97316", description: "Franchise colours and match-day identity—finalised post trials." },
];

async function main() {
  if ((await prisma.team.count()) === 0) {
    await prisma.team.createMany({
      data: defaultTeams.map((t, i) => ({
        ...t,
        sortOrder: i,
        published: true,
      })),
    });
    console.log("Seeded teams:", defaultTeams.length);
  }

  if ((await prisma.heroBanner.count()) === 0) {
    await prisma.heroBanner.createMany({
      data: [
        {
          title: "Future Star U-15",
          subtitle: "Trials open · Delhi NCR · Franchise T20 pathway",
          imageUrl: cricketMatchWide(1920),
          ctaLabel: "Book trial",
          ctaHref: "/register",
          sortOrder: 0,
          published: true,
        },
        {
          title: "Eight franchises",
          subtitle: "Group stages, knockouts, and match-day production",
          imageUrl: cricketTeamGame(1920),
          ctaLabel: "View teams",
          ctaHref: "/teams",
          sortOrder: 1,
          published: true,
        },
        {
          title: "Title sponsor · Krishna Apra",
          subtitle: "Where future stars begin their journey",
          imageUrl: "/branding/logo.png",
          ctaLabel: "Register",
          ctaHref: "/register",
          sortOrder: 2,
          published: true,
        },
      ],
    });
    console.log("Seeded hero banners: 3");
  }

  if ((await prisma.trialZone.count()) === 0) {
    await prisma.trialZone.createMany({
      data: [
        {
          trialPlace: "Krishna Apra Academy Ground",
          zone: "Outer Delhi",
          address: "Sector trial block, Outer Delhi NCR (example address for coordinators).",
          navigationUrl: "https://www.google.com/maps/search/?api=1&query=Delhi+NCR+cricket+ground",
          contactDetails: "Zone desk: +91 98XXX XXXXX · trials@example.org",
          sortOrder: 0,
          published: true,
        },
        {
          trialPlace: "North Delhi Hub",
          zone: "North Delhi",
          address: "Near Model Town complex — follow on-site signage on trial day.",
          navigationUrl: "https://www.google.com/maps/search/?api=1&query=Model+Town+Delhi",
          contactDetails: "Coordinator WhatsApp (10am–6pm): +91 97XXX XXXXX",
          sortOrder: 1,
          published: true,
        },
        {
          trialPlace: "East Delhi nets venue",
          zone: "East Delhi",
          address: "Indoor nets + outfield checks — report 30 minutes before your slot.",
          navigationUrl: "https://www.google.com/maps/search/?api=1&query=East+Delhi+cricket+nets",
          contactDetails: "Help desk at gate · carry trial fee receipt on phone.",
          sortOrder: 2,
          published: true,
        },
      ],
    });
    console.log("Seeded trial zones: 3");
  }

  const blogExists = await prisma.blogPost.findUnique({ where: { slug: SAMPLE_BLOG_SLUG } });
  const blogData = {
    slug: sampleBlogPost.slug,
    title: sampleBlogPost.title,
    excerpt: sampleBlogPost.excerpt,
    content: sampleBlogPost.content,
    coverImageUrl: sampleBlogPost.coverImageUrl,
    authorName: sampleBlogPost.authorName,
    metaTitle: sampleBlogPost.metaTitle,
    metaDescription: sampleBlogPost.metaDescription,
    metaKeywords: sampleBlogPost.metaKeywords,
    published: true,
    publishedAt: new Date(),
    robotsNoindex: false,
  };
  if (!blogExists) {
    await prisma.blogPost.create({ data: blogData });
    console.log("Seeded sample blog post:", SAMPLE_BLOG_SLUG);
  } else if (blogExists.content.trim().startsWith("##")) {
    await prisma.blogPost.update({ where: { slug: SAMPLE_BLOG_SLUG }, data: { content: sampleBlogPost.content } });
    console.log("Updated sample blog post to rich-text HTML:", SAMPLE_BLOG_SLUG);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
