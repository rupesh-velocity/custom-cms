import { prisma } from '@/lib/prisma';
import ShopClient from './ShopClient';

export const revalidate = 0; // Ensure fresh data on each load

export default async function ShopPage() {
  const [courses, products] = await Promise.all([
    prisma.course.findMany({
      where: { status: 'Published' },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      where: { status: 'Published' },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        price: true,
        salePrice: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // Normalize data for the client component
  const normalizedCourses = courses.map(c => ({
    id: `course-${c.id}`,
    originalId: c.id,
    type: 'course',
    title: c.title,
    slug: c.slug,
    image: c.featuredImage,
    price: null, // Courses might not have a direct price, handled differently or in products
    url: `/courses/${c.slug}`
  }));

  const normalizedProducts = products.map(p => ({
    id: `product-${p.id}`,
    originalId: p.id,
    type: 'product',
    title: p.title,
    slug: p.slug,
    image: p.featuredImage,
    price: p.price,
    salePrice: p.salePrice,
    url: `/product/${p.slug || p.id}` // Fallback to id if slug is missing
  }));

  const allItems = [...normalizedCourses, ...normalizedProducts].sort((a, b) => 
    a.title.localeCompare(b.title)
  );

  return <ShopClient initialItems={allItems} />;
}
