import express from 'express';
import nacl from 'tweetnacl';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.text({ type: '*/*' }));

app.post('/discord', async (req, res) => {
  const signature = req.header('x-signature-ed25519');
  const timestamp = req.header('x-signature-timestamp');
  const rawBody = req.body;

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return res.status(401).send('Invalid signature');
  }

  // Handle Discord PING
  const interaction = JSON.parse(rawBody);
  if (interaction.type === 1) {
    return res.json({ type: 1 });
  }

  // Forward to n8n
  await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawBody,
  });

  res.status(200).send('Forwarded to n8n');
});

app.listen(3000, () => {
  console.log('Discord verifier running on port 3000');
});
