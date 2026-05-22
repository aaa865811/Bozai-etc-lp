const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Mzk0149714';
const COOKIE_NAME = 'admin_session';
const COOKIE_VALUE = 'authenticated_2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, error: 'パスワードが正しくありません' });
  }
}
