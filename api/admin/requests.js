import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const COOKIE_NAME = 'admin_session';
const COOKIE_VALUE = 'authenticated_2026';

export default async function handler(req, res) {
  // 認証チェック
  const cookies = req.headers.cookie || '';
  const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));

  if (!cookieMatch || cookieMatch[1] !== COOKIE_VALUE) {
    return res.status(401).json({ success: false, error: '認証が必要です' });
  }

  try {
    const data = await sql`
      SELECT
        id, name, email, birth_year, birth_month, birth_day, age, reasons,
        ip_address, user_agent, created_at
      FROM document_requests
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('DB取得エラー:', error);
    return res.status(500).json({ success: false, error: 'データベースエラー' });
  }
}
