import Config from 'react-native-config';

export const getAISummary = async noteContent => {
  const apiKey = Config.OPENAI_API_KEY;
  const baseUrl = Config.API_BASE_URL;

  console.log(
    'first line of getAISummary, apiKey:',
    !!apiKey,
    'baseUrl:',
    baseUrl,
  );

  if (!apiKey) {
    console.warn('API key missing');
    return 'AI service is not configured.';
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // openAPI  model
        messages: [
          {
            role: 'user',
            content: `Summarize the following note in 2-3 bullet points:\n\n${noteContent}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.5,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log('Groq API error:', res.status, data);
      return data?.error?.message || 'Unable to generate summary.';
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.log('Unexpected response:', data);
      return 'AI returned empty summary.';
    }

    return text.trim();
  } catch (err) {
    console.log('Network error:', err);
    return 'Network error while generating summary.';
  }
};
