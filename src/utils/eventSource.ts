export const BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000'
  : 'http://localhost:5000';

export const createStream = (
  url: string,
  token: string,
  body: any,
  onToken: (t: string) => void,
  onError?: (msg: string) => void,
  onDone?: () => void,
) => {
  console.log('[STREAM] Connecting to:', url);
  console.log('[STREAM] Body:', JSON.stringify(body));

  const xhr = new XMLHttpRequest();
  let offset = 0;

  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.setRequestHeader('Accept', 'text/event-stream');

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
      console.log('[STREAM] Connection opened, status:', xhr.status);
      if (xhr.status !== 200) {
        onError?.(`Stream failed with status ${xhr.status}`);
        xhr.abort();
        return;
      }
    }

    if (
      xhr.readyState === XMLHttpRequest.LOADING ||
      xhr.readyState === XMLHttpRequest.DONE
    ) {
      const newData = xhr.responseText.slice(offset);
      offset = xhr.responseText.length;

      const lines = newData.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const raw = trimmed.slice(5).trim();
        if (!raw || raw === '[DONE]') continue;

        try {
          const json = JSON.parse(raw);
          const content = json?.choices?.[0]?.delta?.content;
          if (content) {
            onToken(content);
          }
        } catch {
          // partial/non-JSON chunk — skip
        }
      }

      if (xhr.readyState === XMLHttpRequest.DONE) {
        onDone?.();
      }
    }
  };

  xhr.onerror = () => {
    onError?.('Stream failed: network error');
  };

  xhr.send(JSON.stringify(body));

  return { close: () => xhr.abort() };
};
