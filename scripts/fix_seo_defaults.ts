import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Fixing hardcoded SEO defaults...');

  // Fix Posts
  const updatePosts = await prisma.post.updateMany({
    where: {
      seoTitle: '%title% %sep% %sitename%'
    },
    data: {
      seoTitle: ''
    }
  });

  const updatePostDescs = await prisma.post.updateMany({
    where: {
      metaDescription: '%excerpt%'
    },
    data: {
      metaDescription: ''
    }
  });

  console.log(`Fixed ${updatePosts.count} posts title, ${updatePostDescs.count} posts desc.`);

  // Fix Pages
  const updatePages = await prisma.page.updateMany({
    where: {
      seoTitle: '%title% %sep% %sitename%'
    },
    data: {
      seoTitle: ''
    }
  });

  const updatePageDescs = await prisma.page.updateMany({
    where: {
      metaDescription: '%excerpt%'
    },
    data: {
      metaDescription: ''
    }
  });

  console.log(`Fixed ${updatePages.count} pages title, ${updatePageDescs.count} pages desc.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
