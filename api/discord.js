import nacl from 'tweetnacl';

export default async function handler(req, res) {
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];

  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const rawBody = Buffer.concat(buffers).toString('utf-8');

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return res.status(401).send('Invalid signature');
  }

  const interaction = JSON.parse(rawBody);

  if (interaction.type === 1) {
    return res.status(200).json({ type: 1 }); // Pong
  }

  // Forward to n8n
  await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawBody,
  });

  return res.status(200).send('Forwarded to n8n');
}

export const config = {
  api: {
    bodyParser: false,
  },
};
