import { http } from '@google-cloud/functions-framework';

http('aiReward', async (req, res) => {
  try {
    const { player, quest } = req.body;

    const prompt = `
You are a game master.

Player: ${player}

Quest result:
${JSON.stringify(quest)}

Determine an appropriate reward.

Return ONLY valid JSON in this exact format:
{
  "gold": number,
  "xp": number
}
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
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini returned no text');
    }

    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const reward = JSON.parse(cleaned);

    res.status(200).json(reward);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
});