import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { images: true, category: true },
      });
      return NextResponse.json(product);
    }

    const products = await prisma.product.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(category && {
          category: { slug: category },
        }),
      },
      include: { images: true, category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
