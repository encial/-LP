/**
 * エンシャルLP お問い合わせ受信Webhook
 * 既存スプレッドシート内の「LPお問い合わせ」シートへ保存し、メール通知します。
 */
const SPREADSHEET_ID = '14gnlVpLTCNPlN2QLIz6c3EXCtOrGS7zYyQLhY-hhvCk';
const SHEET_NAME = 'LPお問い合わせ';
const NOTIFY_EMAIL = 'info-encial@inc.com';

function doPost(e) {
  try {
    const values = e.parameter || {};
    const services = e.parameters && e.parameters['相談したいサービス']
      ? e.parameters['相談したいサービス'].join('、')
      : (values['相談したいサービス'] || '');

    const sheet = getContactSheet_();
    sheet.appendRow([
      new Date(),
      values['お名前'] || '',
      values['法人名・店舗名・屋号'] || '',
      values['メールアドレス'] || '',
      values['電話番号'] || '',
      services,
      values['希望日時'] || '',
      values['現在の課題・相談内容'] || '',
      '未対応',
      ''
    ]);

    sendContactEmail_(values, services);
    return jsonOutput_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonOutput_({ ok: false, message: error.message });
  }
}

function doGet() {
  return jsonOutput_({ ok: true, service: 'Encial LP contact webhook' });
}

function getContactSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow([
      '受付日時', 'お名前', '法人名・店舗名・屋号', 'メールアドレス', '電話番号',
      '相談したいサービス', '希望日時', '現在の課題・相談内容', '対応状況', '担当者メモ'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#b58a43').setFontColor('#ffffff');
  }
  return sheet;
}

function sendContactEmail_(values, services) {
  const subject = '【エンシャルLP】' + (values['法人名・店舗名・屋号'] || 'お客様') + '様から無料相談';
  const body = [
    'LPからお問い合わせが届きました。', '',
    'お名前：' + (values['お名前'] || ''),
    '法人名・店舗名・屋号：' + (values['法人名・店舗名・屋号'] || ''),
    'メールアドレス：' + (values['メールアドレス'] || ''),
    '電話番号：' + (values['電話番号'] || ''),
    '相談したいサービス：' + services,
    '希望日時：' + (values['希望日時'] || ''), '',
    '現在の課題・相談内容：',
    values['現在の課題・相談内容'] || ''
  ].join('\n');
  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: body, replyTo: values['メールアドレス'] || NOTIFY_EMAIL });
}

function jsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function testContactSubmission() {
  doPost({
    parameter: {
      'お名前': 'テスト 太郎',
      '法人名・店舗名・屋号': 'テスト株式会社',
      'メールアドレス': 'test@example.com',
      '電話番号': '090-0000-0000',
      '希望日時': '2026-07-10 13:00',
      '現在の課題・相談内容': 'LPフォームの動作テストです。'
    },
    parameters: { '相談したいサービス': ['SNS運用代行', '広告運用'] }
  });
}
