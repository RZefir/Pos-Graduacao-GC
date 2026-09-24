import { http } from '@google-cloud/functions-framework';
import { Firestore } from '@google-cloud/firestore';

const db = new Firestore({
  databaseId: 'europe-west1'
});

http('reward', async (req, res) => {
  try {
    const data = req.body;
    const requestId = data.requestId;

    if (!requestId) {
      return res.status(400).json({
        error: 'requestId is required'
      });
    }

    const requestRef = db
      .collection('processedRequests')
      .doc(requestId);

    const existingRequest = await requestRef.get();

    if (existingRequest.exists) {
      return res.status(200).json({
        ...existingRequest.data(),
        idempotent: true,
        message: 'Request already processed.'
      });
    }

    const result = {
      ...data,
      reward: {
        xp: 100,
        gold: 25
      },
      status: 'completed',
      message: 'Quest complete.'
    };

    await requestRef.create(result);

    return res.status(200).json({
      ...result,
      idempotent: false
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
});