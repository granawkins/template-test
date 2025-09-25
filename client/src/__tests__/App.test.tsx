import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import App from '../App';

// Define types
interface Tweet {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

// Mock the fetch API
globalThis.fetch = vi.fn() as unknown as typeof fetch;

function mockTweetsResponse(tweets: Tweet[]) {
  return {
    json: vi.fn().mockResolvedValue(tweets),
    ok: true,
    status: 200,
    statusText: 'OK',
  };
}

function mockPostResponse(tweet: Tweet) {
  return {
    json: vi.fn().mockResolvedValue(tweet),
    ok: true,
    status: 201,
    statusText: 'Created',
  };
}

function mockErrorResponse(error: string, status = 400) {
  return {
    json: vi.fn().mockResolvedValue({ error }),
    ok: false,
    status,
    statusText: 'Bad Request',
  };
}

describe('Twitter Clone App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: empty tweets array
    (globalThis.fetch as unknown as Mock).mockResolvedValue(
      mockTweetsResponse([])
    );
  });

  it('renders Twitter clone UI correctly', () => {
    render(<App />);

    // Check for main elements
    expect(screen.getByText('🐦 Twitter Clone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What's happening?")
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tweet/i })).toBeInTheDocument();
    expect(
      screen.getByText('No tweets yet. Be the first to tweet!')
    ).toBeInTheDocument();
  });

  it('fetches and displays tweets on load', async () => {
    const mockTweets: Tweet[] = [
      {
        id: '1',
        content: 'Test tweet content',
        author: 'Test Author',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    ];

    (globalThis.fetch as unknown as Mock).mockResolvedValue(
      mockTweetsResponse(mockTweets)
    );

    render(<App />);

    // Wait for tweets to load
    await waitFor(() => {
      expect(screen.getByText('Test tweet content')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/tweets');
  });

  it('handles tweet fetch error', async () => {
    (globalThis.fetch as unknown as Mock).mockRejectedValue(
      new Error('Failed to fetch tweets')
    );

    render(<App />);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tweets/)).toBeInTheDocument();
    });
  });

  it('disables submit button when fields are empty', () => {
    render(<App />);

    const submitButton = screen.getByRole('button', { name: /tweet/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when both fields are filled', async () => {
    render(<App />);

    const nameInput = screen.getByPlaceholderText('Your name');
    const contentInput = screen.getByPlaceholderText("What's happening?");
    const submitButton = screen.getByRole('button', { name: /tweet/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(contentInput, { target: { value: 'Test tweet' } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows character count', async () => {
    render(<App />);

    const contentInput = screen.getByPlaceholderText("What's happening?");

    // Initially shows 0/280
    expect(screen.getByText('0/280')).toBeInTheDocument();

    // Update content and check count
    fireEvent.change(contentInput, { target: { value: 'Hello' } });

    await waitFor(() => {
      expect(screen.getByText('5/280')).toBeInTheDocument();
    });
  });
});
