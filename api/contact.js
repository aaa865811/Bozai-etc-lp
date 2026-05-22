import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, birth_year, birth_month, birth_day, reasons, consent } = req.body;

    // バリデーション
    if (!name || !email || !birth_year || !birth_month || !birth_day || !consent) {
      return res.status(400).json({
        success: false,
        error: '必須項目が不足しています'
      });
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'メールアドレスの形式が正しくありません'
      });
    }

    // 生年月日・年齢計算
    const birthDate = `${birth_year}年${birth_month}月${birth_day}日`;
    const today = new Date();
    let age = today.getFullYear() - birth_year;
    const monthDiff = today.getMonth() + 1 - birth_month;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth_day)) {
      age--;
    }

    const reasonsText = Array.isArray(reasons) && reasons.length > 0
      ? reasons.map(r => `・${r}`).join('\n')
      : '（未選択）';

    const timestamp = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo'
    });

    // XSS対策: HTMLエスケープ
    const esc = (str) => String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    // 管理者宛メール
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: `【資料請求】${name} 様（${age}歳）`,
      html: `
        <h2>新しい資料請求がありました</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>お名前</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${esc(name)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>メール</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${esc(email)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>生年月日</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${esc(birthDate)}（${age}歳）</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>検討きっかけ</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;"><pre style="margin:0;font-family:inherit;">${esc(reasonsText)}</pre></td></tr>
          <tr><td style="padding: 8px;"><strong>受付日時</strong></td><td style="padding: 8px;">${timestamp}</td></tr>
        </table>
      `
    });

    // 申込者宛 自動返信メール
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: '【ネットスクール】資料請求を承りました',
      text: `${name} 様

この度はネットスクール税理士講座への資料請求をいただき、誠にありがとうございます。
下記のURLよりデジタルパンフレットをご覧いただけますので、是非、ご活用ください。

▼税理士講座デジタルパンフレットURL
https://my.ebook5.net/ns_dejipan1/net-school_zeirishi/

▼税理士WEB講座 無料体験講義・無料説明会はこちら▼
https://www.net-school.co.jp/events/zei/

▼ネットスクールホームページへ戻る▼
https://www.net-school.co.jp/

また、ご覧いただきご不明な点はお気軽にお問い合わせください。

ネットスクール株式会社
〒101-0061 東京都千代田区神田三崎町1-2-15
TEL: 0120-979-919（受付時間：10:00-18:00 平日）
`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    });
  }
}
