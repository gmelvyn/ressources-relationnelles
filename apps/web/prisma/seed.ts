import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/lib/generated/prisma/client";
import { categorySeeds, relationTypeSeeds, resourceSeeds, resourceTypeSeeds } from "../src/lib/resource-fixtures";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  for (const category of categorySeeds) {
    await prisma.resourceCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const relation of relationTypeSeeds) {
    await prisma.relationType.upsert({
      where: { slug: relation.slug },
      update: relation,
      create: relation,
    });
  }

  for (const type of resourceTypeSeeds) {
    await prisma.resourceType.upsert({
      where: { slug: type.slug },
      update: type,
      create: type,
    });
  }

  for (const resource of resourceSeeds) {
    const category = await prisma.resourceCategory.findUniqueOrThrow({
      where: { slug: resource.categorySlug },
      select: { id: true },
    });
    const type = await prisma.resourceType.findUniqueOrThrow({
      where: { slug: resource.typeSlug },
      select: { id: true },
    });
    const relations = await prisma.relationType.findMany({
      where: { slug: { in: resource.relationSlugs } },
      select: { id: true },
    });

    await prisma.resource.upsert({
      where: { slug: resource.slug },
      update: {
        title: resource.title,
        summary: resource.summary,
        content: resource.content,
        sourceUrl: resource.sourceUrl ?? null,
        imageUrl: resource.imageUrl ?? null,
        durationMinutes: resource.durationMinutes,
        difficulty: resource.difficulty,
        visibility: resource.visibility ?? "PUBLIC",
        categoryId: category.id,
        typeId: type.id,
        relations: {
          deleteMany: {},
          create: relations.map((relation) => ({ relationTypeId: relation.id })),
        },
      },
      create: {
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        content: resource.content,
        sourceUrl: resource.sourceUrl ?? null,
        imageUrl: resource.imageUrl ?? null,
        durationMinutes: resource.durationMinutes,
        difficulty: resource.difficulty,
        status: "PUBLISHED",
        visibility: resource.visibility ?? "PUBLIC",
        publishedAt: new Date(),
        categoryId: category.id,
        typeId: type.id,
        relations: {
          create: relations.map((relation) => ({ relationTypeId: relation.id })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
