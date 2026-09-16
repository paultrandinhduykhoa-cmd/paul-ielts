import { Client } from '@notionhq/client';

// Khởi tạo Notion Client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const PASSAGES_DB_ID = process.env.NOTION_PASSAGES_DB_ID!;
const QUESTIONS_DB_ID = process.env.NOTION_QUESTIONS_DB_ID!;

export type QuizQuestion = {
  id: string;
  text: string;
  type: 'True/False/Not Given' | 'Trắc nghiệm';
  options: string[];
  answer: string;
  explanation: string;
};

export type QuizData = {
  title: string;
  paragraphs: string[];
  duration: number;
  questions: QuizQuestion[];
};

/**
 * Helper lấy văn bản an toàn cho cả Title lẫn Rich Text từ Notion Properties
 */
function getTextContent(props: any, key: string): string {
  const prop = props[key];
  if (!prop) return '';
  if (prop.title && Array.isArray(prop.title)) {
    return prop.title.map((t: any) => t.plain_text).join('');
  }
  if (prop.rich_text && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((t: any) => t.plain_text).join('');
  }
  return '';
}

/**
 * Helper lấy giá trị Select
 */
function getSelect(props: any, key: string): string {
  return props[key]?.select?.name ?? '';
}

/**
 * Helper lấy giá trị Number
 */
function getNumber(props: any, key: string): number {
  return props[key]?.number ?? 0;
}

/**
 * Helper query an toàn bypass TypeScript check cho các bản SDK Notion khác nhau
 */
async function queryNotionDatabase(params: any) {
  const n = notion as any;
  if (n.databases?.query) {
    return await n.databases.query(params);
  }
  if (n.dataSources?.query) {
    return await n.dataSources.query({
      data_source_id: params.database_id,
      filter: params.filter,
      sorts: params.sorts,
    });
  }
  throw new Error('Không tìm thấy phương thức query tương thích trong Notion SDK');
}

/**
 * Lấy danh sách các bài đọc đã xuất bản
 */
export async function getPublishedPassages() {
  try {
    const res = await queryNotionDatabase({
      database_id: PASSAGES_DB_ID,
      filter: { property: 'Trạng thái', select: { equals: 'Đã xuất bản' } },
      sorts: [{ property: 'Thứ tự hiển thị', direction: 'ascending' }],
    });

    return res.results.map((page: any) => ({
      id: page.id,
      title: getTextContent(page.properties, 'Tên bài đọc'),
      band: getSelect(page.properties, 'Band mục tiêu'),
      duration: getNumber(page.properties, 'Thời gian làm bài (giây)'),
      slug: getTextContent(page.properties, 'Slug'),
    }));
  } catch (error) {
    console.error('Lỗi getPublishedPassages:', error);
    return [];
  }
}

/**
 * Lấy chi tiết bài đọc và danh sách câu hỏi dựa vào Slug
 */
export async function getPassageWithQuestions(slug: string): Promise<QuizData | null> {
  try {
    // 1. Tìm Bài đọc theo Slug
    const passageRes = await queryNotionDatabase({
      database_id: PASSAGES_DB_ID,
      filter: { property: 'Slug', rich_text: { equals: slug } },
    });

    const passagePage = passageRes.results[0] as any;
    if (!passagePage) {
      console.warn(`[Notion API] Không tìm thấy bài đọc nào với slug: "${slug}"`);
      return null;
    }

    // Tách văn bản thành các đoạn
    const rawText = getTextContent(passagePage.properties, 'Nội dung đoạn văn');
    const paragraphs = rawText
      ? rawText.split('\n').map((p) => p.trim()).filter(Boolean)
      : [];

    // 2. Tìm danh sách câu hỏi liên kết với Bài đọc này
    const questionsRes = await queryNotionDatabase({
      database_id: QUESTIONS_DB_ID,
      filter: {
        property: 'Bài đọc',
        relation: {
          contains: passagePage.id,
        },
      },
      sorts: [{ property: 'Thứ tự câu hỏi', direction: 'ascending' }],
    });

    // Parse từng câu hỏi
    const questions: QuizQuestion[] = questionsRes.results.map((q: any) => {
      const type = getSelect(q.properties, 'Loại câu hỏi') as QuizQuestion['type'];

      const options =
        type === 'Trắc nghiệm'
          ? [
              getTextContent(q.properties, 'Lựa chọn A'),
              getTextContent(q.properties, 'Lựa chọn B'),
              getTextContent(q.properties, 'Lựa chọn C'),
              getTextContent(q.properties, 'Lựa chọn D'),
            ].filter(Boolean)
          : ['True', 'False', 'Not Given'];

      return {
        id: q.id,
        text: getTextContent(q.properties, 'Nội dung câu hỏi'),
        type,
        options,
        answer: getTextContent(q.properties, 'Đáp án đúng'),
        explanation: getTextContent(q.properties, 'Giải thích đáp án'),
      };
    });

    return {
      title: getTextContent(passagePage.properties, 'Tên bài đọc'),
      paragraphs,
      duration: getNumber(passagePage.properties, 'Thời gian làm bài (giây)') || 300,
      questions,
    };
  } catch (error) {
    console.error('Lỗi getPassageWithQuestions:', error);
    throw error;
  }
}