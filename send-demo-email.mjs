import { readFile } from 'node:fs/promises';

const recipient = process.argv[2];
const apiKey = process.env.RESEND_API_KEY;

if (!recipient || !recipient.includes('@')) {
  console.error('Usage: node send-demo-email.mjs recipient@example.com');
  process.exit(1);
}

if (!apiKey) {
  console.error('Missing RESEND_API_KEY. In PowerShell run:');
  console.error('$env:RESEND_API_KEY="re_your_key_here"');
  process.exit(1);
}

const templatePath = new URL('./invite-email-template.html', import.meta.url);
let html = await readFile(templatePath, 'utf8');

const portalUrl =
  'https://www.nicoofurniture.co.ke/Analytics/web';

html = html
  .replaceAll('{{ROLE}}', 'Viewer')
  .replaceAll('{{PROPERTY_NAME}}', 'nicoofurniture.co.ke')
  .replaceAll('{{RECIPIENT_EMAIL}}', recipient)
  .replaceAll('{{ACCESS_URL}}', portalUrl);

const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Nicoo Furniture Analytics <analytics@nicoofurniture.co.ke>',
    to: [recipient],
    subject: 'You have been granted analytics access for nicoofurniture.co.ke',
    html,
    text:
      'Hello,\n\n' +
      'We want to alert you that you have been granted Viewer access to the analytics account for nicoofurniture.co.ke.\n\n' +
      'Open the analytics portal: ' + portalUrl + '\n\n' +
      'Sincerely,\nThe Nicoo Furniture Analytics Team',
  }),
});

const body = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error('Resend rejected the email:');
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log('Email sent successfully ✅');
console.log('Resend email id:', body.id);
