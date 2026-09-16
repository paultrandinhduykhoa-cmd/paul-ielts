import { NextResponse } from 'next/server';
import { getPassageWithQuestions } from '@/lib/notion';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await getPassageWithQuestions(slug);

    if (!data) {
      return NextResponse.json(
        { error: `Không tìm thấy bài đọc với slug: ${slug}` },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Lỗi API Route Notion:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi server khi lấy dữ liệu Notion' },
      { status: 500 }
    );
  }
}
