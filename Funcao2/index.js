import { http } from '@google-cloud/functions-framework';

http('helloHttp', (req, res) => {
  const data = req.body;

  res.status(200).json({
    ...data,
    inventory: [
      'rusty sword',
      'small potion'
    ],
    status: 'inventory_checked'
  });
});