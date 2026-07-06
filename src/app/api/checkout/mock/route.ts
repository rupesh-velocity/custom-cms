import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { productId, name, email, password } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('cms_session')?.value;
    
    let userId: number | null = null;
    let userEmail: string = email || '';
    
    if (token) {
      try {
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production'
        );
        const { payload } = await jwtVerify(token, secret);
        userId = payload.id as number;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          userEmail = user.email;
        }
      } catch (error) {
        // invalid token
      }
    }
    
    let isNewUser = false;

    // Create user if not logged in
    if (!userId) {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password required for checkout.' }, { status: 400 });
      }
      
      // Check if user already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          username: email,
          email,
          password: hashedPassword,
          firstName: name?.split(' ')[0] || '',
          lastName: name?.split(' ').slice(1).join(' ') || '',
          role: 'Subscriber'
        }
      });
      userId = newUser.id;
      isNewUser = true;
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create an order (simplified for mock checkout)
    const order = await prisma.order.create({
      data: {
        customerId: userId,
        customerEmail: userEmail,
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

    const response = NextResponse.json({ success: true, orderId: order.id });

    // Set cookie if we just created a new user
    if (isNewUser && userId) {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production'
      );
      const newToken = await new SignJWT({ id: userId, role: 'Subscriber' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secret);
        
      response.cookies.set('cms_session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 1 day
      });
    }

    return response;
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
