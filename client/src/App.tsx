import { useState, useEffect } from 'react';

interface Tweet {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

function App() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [newTweet, setNewTweet] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tweets from the server
  const fetchTweets = async () => {
    try {
      const response = await fetch('/api/tweets');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setTweets(data);
    } catch (err) {
      console.error('Error fetching tweets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
    }
  };

  // Post a new tweet
  const postTweet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTweet.trim() || !author.trim()) {
      setError('Both author and tweet content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newTweet,
          author: author,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post tweet');
      }

      setNewTweet('');
      fetchTweets(); // Refresh tweets after posting
    } catch (err) {
      console.error('Error posting tweet:', err);
      setError(err instanceof Error ? err.message : 'Failed to post tweet');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Fetch tweets on component mount and set up polling
  useEffect(() => {
    fetchTweets();

    // Poll for new tweets every 3 seconds
    const interval = setInterval(fetchTweets, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h1
            style={{
              margin: '0 0 20px 0',
              color: '#1da1f2',
              fontSize: '28px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            🐦 Twitter Clone
          </h1>

          {/* Tweet Form */}
          <form onSubmit={postTweet}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <textarea
                placeholder="What's happening?"
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                maxLength={280}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '12px',
                  color: '#657786',
                  marginTop: '4px',
                }}
              >
                {newTweet.length}/280
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !newTweet.trim() || !author.trim()}
              style={{
                backgroundColor: '#1da1f2',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity:
                  loading || !newTweet.trim() || !author.trim() ? 0.5 : 1,
              }}
            >
              {loading ? 'Tweeting...' : 'Tweet'}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Tweet Feed */}
        <div>
          {tweets.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                color: '#657786',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              No tweets yet. Be the first to tweet!
            </div>
          ) : (
            tweets.map((tweet) => (
              <div
                key={tweet.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#1da1f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      marginRight: '12px',
                    }}
                  >
                    {tweet.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 'bold',
                        color: '#14171a',
                        fontSize: '16px',
                      }}
                    >
                      {tweet.author}
                    </div>
                    <div
                      style={{
                        color: '#657786',
                        fontSize: '14px',
                      }}
                    >
                      {formatTimestamp(tweet.timestamp)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    color: '#14171a',
                    fontSize: '16px',
                    lineHeight: '1.4',
                    marginLeft: '52px',
                  }}
                >
                  {tweet.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
