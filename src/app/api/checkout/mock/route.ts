import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('cms_session')?.value;
    
    let userId: number | null = null;
    
    if (token) {
      try {
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production'
        );
        const { payload } = await jwtVerify(token, secret);
        userId = payload.id as number;
      } catch (error) {
        // invalid token
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'You must be logged in to purchase.' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch user for email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Create an order (simplified for mock checkout)
    const order = await prisma.order.create({
      data: {
        customerId: userId,
        customerEmail: user?.email || user?.username || 'mock@example.com',
        orderNumber: `MOCK-${Date.now()}`,
        status: 'COMPLETED',
        totalAmount: product.salePrice || product.price || 0,
        billingAddress: '{}',
        shippingAddress: '{}',
        items: {
          create: [{
            productId: product.id,
            name: product.title,
            quantity: 1,
            price: product.salePrice || product.price || 0,
            total: product.salePrice || product.price || 0
          }]
        }
      }
    });

    // If product has a linked course, grant access!
    if (product.linkedCourseId) {
      // Check if access already exists
      const existingAccess = await prisma.userCourseAccess.findFirst({
        where: {
          userId: userId,
          courseId: product.linkedCourseId
        }
      });
      
      if (!existingAccess) {
        await prisma.userCourseAccess.create({
          data: {
            userId: userId,
            courseId: product.linkedCourseId
          }
        });
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
