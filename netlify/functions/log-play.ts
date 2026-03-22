export const handler = async (event: any, context: any) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({error: 'Method Not Allowed'})
    };
  }

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Invalid JSON body'})
    };
  }

  const {username, password, gameId, date, length = 0, comments = ''} = body;

  if (!username || !password || !gameId || !date) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Missing required parameters'})
    };
  }

  try {
    // 1. Authenticate with BGG to get session cookies
    const loginResponse = await fetch('https://boardgamegeek.com/login/api/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({credentials: {username, password}}),
    });

    let loginData: any = {};
    if (loginResponse.status !== 204) {
      try {
        loginData = await loginResponse.json();
      } catch (err) {
        // Ignored
      }
    }

    if (!loginResponse.ok || loginData.errors) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Authentication failed',
          details: loginData.errors?.message || 'Invalid credentials',
        })
      };
    }

    // Extract cookies from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      return {
        statusCode: 500,
        body: JSON.stringify({error: 'No session cookies received from BGG'})
      };
    }

    // Parse out the SessionID
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [ setCookieHeader ];
    const sessionCookieStr = cookies.find((c: string) => c.includes('SessionID='));
    
    // Some Fetch API implementations combine Set-Cookie into one string separated by commas.
    // We just pass the entire valid cookie string back to BGG if it's combined.
    const cookieHeaderVal = setCookieHeader.split(',').map(part => part.split(';')[0]).filter(c => c.includes('=')).join('; ');

    // 2. Post the play
    const playData = new URLSearchParams();
    playData.append('playdate', date); // YYYY-MM-DD
    playData.append('action', 'save');
    playData.append('objectid', gameId);
    playData.append('objecttype', 'thing');
    playData.append('quantity', '1');
    playData.append('length', length.toString());
    playData.append('twitter', '0');
    playData.append('comments', comments);
    playData.append('ajax', '1');

    const playResponse = await fetch('https://boardgamegeek.com/geekplay.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieHeaderVal,
        'Origin': 'https://boardgamegeek.com',
        'Referer': `https://boardgamegeek.com/boardgame/${gameId}`,
      },
      body: playData.toString(),
    });

    if (!playResponse.ok) {
      const text = await playResponse.text();
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: 'Failed to log play on BGG',
          status: playResponse.status,
          details: text.substring(0, 500)
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({success: true, message: 'Play logged successfully'})
    };

  } catch (err: any) {
    console.error('BGG API proxy error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Internal Server Error', details: err.message})
    };
  }
};
