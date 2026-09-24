import { http } from '@google-cloud/functions-framework';

const REWARD_TOOL = {
  functionDeclarations: [
    {
      name: 'grantReward',
      description:
        'Grants the player a reward for completing a quest, based on quest difficulty, outcome, and player performance.',
      parameters: {
        type: 'OBJECT',
        properties: {
          gold: {
            type: 'INTEGER',
            description: 'Amount of gold to award the player. Must be a non-negative integer.'
          },
          xp: {
            type: 'INTEGER',
            description: 'Amount of experience points to award the player. Must be a non-negative integer.'
          },
          reason: {
            type: 'STRING',
            description: 'A short, one-sentence in-universe justification for this reward, written as the game master.'
          }
        },
        required: ['gold', 'xp']
      }
    }
  ]
};

http('aiReward', async (req, res) => {
  try {
    const { player, quest } = req.body;

    const prompt = `
You are a game master.

Player: ${player}

Quest result:
${JSON.stringify(quest)}

Call the grantReward function with an appropriate gold and xp amount for this quest outcome, and a short reason.
`;

    const tokenResponse = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      {
        headers: {
          'Metadata-Flavor': 'Google'
        }
      }
    );

    const { access_token } = await tokenResponse.json();

    const response = await fetch(
      'https://aiplatform.googleapis.com/v1/projects/test-projects-509305/locations/global/publishers/google/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          tools: [REWARD_TOOL],
          toolConfig: {
            functionCallingConfig: {
              mode: 'ANY',
              allowedFunctionNames: ['grantReward']
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const functionCallPart = parts.find((p) => p.functionCall);

    if (!functionCallPart) {
      throw new Error('Gemini did not return a function call');
    }

    const { gold, xp, reason } = functionCallPart.functionCall.args ?? {};

    if (typeof gold !== 'number' || typeof xp !== 'number') {
      throw new Error(`Invalid reward args from model: ${JSON.stringify(functionCallPart.functionCall.args)}`);
    }

    res.status(200).json({ gold, xp, reason });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
});