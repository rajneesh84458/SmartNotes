// import Config from 'react-native-config';

// export const getAISummary = async noteContent => {
//   const apiKey = Config.OPENAI_API_KEY;
//   const baseUrl = Config.API_BASE_URL;

//   console.log(
//     'first line of getAISummary, apiKey:',
//     !!apiKey,
//     'baseUrl:',
//     baseUrl,
//   );

//   if (!apiKey) {
//     console.warn('API key missing');
//     return 'AI service is not configured.';
//   }

//   try {
//     const res = await fetch(`${baseUrl}/chat/completions`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o-mini', // openAPI  model
//         messages: [
//           {
//             role: 'user',
//             content: `Summarize the following note in 2-3 bullet points:\n\n${noteContent}`,
//           },
//         ],
//         max_tokens: 150,
//         temperature: 0.5,
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       console.log('Groq API error:', res.status, data);
//       return data?.error?.message || 'Unable to generate summary.';
//     }

//     const text = data?.choices?.[0]?.message?.content;

//     if (!text) {
//       console.log('Unexpected response:', data);
//       return 'AI returned empty summary.';
//     }

//     return text.trim();
//   } catch (err) {
//     console.log('Network error:', err);
//     return 'Network error while generating summary.';
//   }
// };

const dummySummaries = [
  `• Overview of document content
• Contains important business insights
• Recommended for quick reading`,

  `• Technical details explained simply
• Covers API and architecture concepts
• Useful for developers`,

  `• Financial data summary
• Highlights profit and loss trends
• Useful for decision making`,

  `• User behavior insights
• Shows engagement patterns
• Helps improve UX`,

  `• Project requirements listed
• Includes timelines and deliverables
• Useful for planning`,

  `• Error logs summarized
• Identifies key issues
• Suggests possible fixes`,

  `• Meeting notes summary
• Captures key discussion points
• Lists action items`,

  `• Research findings overview
• Highlights main conclusions
• Useful for reports`,

  `• Product features explained
• Covers benefits and usage
• Helpful for onboarding`,

  `• Security insights
• Points out vulnerabilities
• Suggests improvements`,
];

export const getAISummary = async noteContent => {
  await new Promise(r => setTimeout(r, 800));

  const random =
    dummySummaries[Math.floor(Math.random() * dummySummaries.length)];

  return random;
};
