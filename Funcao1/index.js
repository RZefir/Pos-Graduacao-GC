import { http } from '@google-cloud/functions-framework';


http('path', (req, res) => {
  const player = req.body?.player || 'traveler';
  const requestId = req.body?.requestId || 'demo-request';

  res.status(200).json({
    requestId,
    player,
    quest: 'The Lost GREAT  GREAT Dungeon',
    status: 'started',
    message: `The path ahead is dangerous, ${player}.`
  });
});
