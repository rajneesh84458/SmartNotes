// ...existing code...
import Config from 'react-native-config';

export const getAISummary = async noteContent => {
  const apiKey = Config.OPENAI_API_KEY;
  const baseUrl = Config.API_BASE_URL;

  console.log('baseUrl------', baseUrl);

  if (!apiKey) {
    console.warn(
      'OpenAI API key missing. Check .env formatting (no spaces around "=") and restart Metro.',
    );
    return 'AI service is not configured. Please set OPENAI_API_KEY in .env and restart the app.';
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: `Summarize in 2-3 bullet points:\n\n${noteContent}`,
        max_output_tokens: 150,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.log('OpenAI API error:', res.status, data);
      return data?.error?.message || 'Unable to generate summary (API error).';
    }

    const text =
      data?.output?.[0]?.content?.[0]?.text ||
      (Array.isArray(data?.output?.[0]?.content) &&
        data.output[0].content.map(c => c.text).join('\n')) ||
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      null;

    if (!text) {
      console.log('Unexpected OpenAI response format:', data);
      return 'Unable to generate summary (unexpected response).';
    }

    return String(text).trim();
  } catch (err) {
    console.log('Network or parsing error calling OpenAI:', err);
    return 'Network error while generating summary. Please try again.';
  }
};
