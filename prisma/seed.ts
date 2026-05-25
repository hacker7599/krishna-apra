import { PrismaClient } from "@prisma/client";
import { sampleBlogPost, SAMPLE_BLOG_SLUG } from "../src/lib/blog-sample-post";
import { OFFICIAL_TRIAL_VENUES } from "../src/lib/trial-zone-catalog";
import { renumberTrialZoneSortOrders } from "../src/lib/trial-zone-sort";
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

async function syncOfficialTrialZones() {
  const ids: string[] = [];
  for (let i = 0; i < OFFICIAL_TRIAL_VENUES.length; i++) {
    const v = OFFICIAL_TRIAL_VENUES[i];
    const existing = await prisma.trialZone.findFirst({
      where: { trialPlace: v.trialPlace, zone: v.zone },
    });
    const row = existing
      ? await prisma.trialZone.update({
          where: { id: existing.id },
          data: {
            address: v.address,
            navigationUrl: v.navigationUrl,
            contactDetails: v.contactDetails,
            sortOrder: i,
            published: true,
          },
        })
      : await prisma.trialZone.create({
          data: {
            trialPlace: v.trialPlace,
            zone: v.zone,
            address: v.address,
            navigationUrl: v.navigationUrl,
            contactDetails: v.contactDetails,
            sortOrder: i,
            published: true,
          },
        });
    ids.push(row.id);
  }
  const officialCount = OFFICIAL_TRIAL_VENUES.length;
  if (ids.length > 0) {
    await prisma.trialZone.updateMany({
      where: { id: { notIn: ids } },
      data: { published: false },
    });
    const legacy = await prisma.trialZone.findMany({
      where: { id: { notIn: ids } },
      orderBy: [{ trialPlace: "asc" }, { zone: "asc" }],
    });
    for (let i = 0; i < legacy.length; i++) {
      await prisma.trialZone.update({
        where: { id: legacy[i].id },
        data: { sortOrder: officialCount + i },
      });
    }
  }
  const renumbered = await renumberTrialZoneSortOrders(prisma);
  console.log("Synced official trial zones:", officialCount, "· renumbered:", renumbered);
}

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

  await syncOfficialTrialZones();

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
