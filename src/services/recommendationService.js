/**
 * AI-Powered Book Recommendation Service using Claude API
 * Analyzes reading history and rating patterns to generate personalized suggestions
 */

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Builds a comprehensive reading profile from user's reading history
 */
function buildReadingProfile(books) {
  const finishedBooks = books.filter(b => b.status === 'Finished' && b.rating > 0);
  
  if (finishedBooks.length === 0) {
    return null;
  }

  // Analyze rating patterns
  const ratingDistribution = {};
  const genrePreferences = {};
  const authorPreferences = {};
  let totalPages = 0;
  let totalRating = 0;

  finishedBooks.forEach(book => {
    // Rating analysis
    ratingDistribution[book.rating] = (ratingDistribution[book.rating] || 0) + 1;
    totalRating += book.rating;

    // Genre preferences
    if (book.genre) {
      genrePreferences[book.genre] = (genrePreferences[book.genre] || 0) + 1;
    }

    // Author tracking
    if (book.author) {
      authorPreferences[book.author] = (authorPreferences[book.author] || 0) + 1;
    }

    // Pages tracking
    if (book.pages) {
      totalPages += parseInt(book.pages) || 0;
    }
  });

  const avgRating = (totalRating / finishedBooks.length).toFixed(1);
  const avgPageLength = Math.round(totalPages / finishedBooks.length);

  // Get top genres and authors
  const topGenres = Object.entries(genrePreferences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre, count]) => ({ genre, count }));

  const topAuthors = Object.entries(authorPreferences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([author, count]) => ({ author, count }));

  return {
    totalBooksRead: finishedBooks.length,
    avgRating,
    avgPageLength,
    topGenres,
    topAuthors,
    preferredRatings: Object.entries(ratingDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([rating, count]) => ({ rating: parseFloat(rating), count })),
    recentBooks: finishedBooks.slice(-5).reverse(),
    allFinishedBooks: finishedBooks
  };
}

/**
 * Constructs an engineered prompt for Claude to generate personalized recommendations
 */
function buildRecommendationPrompt(profile, books) {
  const readBooks = books.map(b => `"${b.title}" by ${b.author}`).join(', ');
  const topGenresStr = profile.topGenres.map(g => g.genre).join(', ');
  const topAuthorsStr = profile.topAuthors.map(a => a.author).join(', ');
  const recentBooksStr = profile.recentBooks
    .map(b => `"${b.title}" (${b.rating}/5 stars - ${b.review ? b.review.substring(0, 50) : 'No review'})`)
    .join('; ');

  return `You are an expert book recommendation engine. Analyze this reader's preferences and suggest 6 personalized book recommendations.

READER PROFILE:
- Total books read: ${profile.totalBooksRead}
- Average rating given: ${profile.avgRating}/5
- Preferred book length: ${profile.avgPageLength} pages (on average)
- Favorite genres: ${topGenresStr}
- Favorite authors: ${topAuthorsStr}
- Most common ratings given: ${profile.preferredRatings.map(r => `${r.rating}/5 (${r.count} books)`).join(', ')}
- Recently read books: ${recentBooksStr}
- Books already read: ${readBooks}

Based on this profile, generate EXACTLY 6 book recommendations in the following JSON format:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "genre": "Primary Genre",
    "whyRecommended": "2-3 sentences explaining why this book matches their preferences, referencing specific aspects of their reading history",
    "similarTo": "A book they've read that this is similar to",
    "estimatedPages": 300,
    "matchScore": 95
  },
  ... 5 more recommendations
]

IMPORTANT INSTRUCTIONS:
1. Only recommend books they haven't already read
2. Match recommendations to their favorite genres (${topGenresStr})
3. Consider their average rating preference (${profile.avgRating}/5)
4. Provide contextual explanations that reference their specific reading history
5. Include a match score (0-100) based on how well it fits their profile
6. Suggest books similar to ones they highly rated
7. Vary the genres but keep them within their preferences
8. Return ONLY valid JSON, no other text

Ensure the recommendations are diverse yet aligned with their demonstrated preferences.`;
}

/**
 * Calls Claude API to generate AI-powered recommendations
 */
async function generateRecommendationsWithClaude(profile, books) {
  if (!CLAUDE_API_KEY) {
    throw new Error(
      'Claude API key not configured. Please set VITE_CLAUDE_API_KEY environment variable.'
    );
  }

  const prompt = buildRecommendationPrompt(profile, books);

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Claude API error: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const responseText = data.content[0].text;

  // Extract JSON from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Claude response as JSON');
  }

  const recommendations = JSON.parse(jsonMatch[0]);

  // Validate and normalize recommendations
  return recommendations.map(rec => ({
    title: rec.title || 'Unknown',
    author: rec.author || 'Unknown',
    genre: rec.genre || 'Fiction',
    whyRecommended: rec.whyRecommended || '',
    similarTo: rec.similarTo || '',
    estimatedPages: rec.estimatedPages || 300,
    matchScore: Math.min(Math.max(rec.matchScore || 0, 0), 100),
    source: 'claude-ai'
  }));
}

/**
 * Generates book recommendations using AI and reading history analysis
 */
export async function getAIRecommendations(books) {
  try {
    // Build reading profile from history
    const profile = buildReadingProfile(books);

    if (!profile) {
      return {
        success: false,
        message: 'Please read and rate at least one book to get AI recommendations',
        recommendations: []
      };
    }

    // Generate recommendations using Claude
    const recommendations = await generateRecommendationsWithClaude(profile, books);

    return {
      success: true,
      recommendations,
      profile: {
        totalBooksRead: profile.totalBooksRead,
        avgRating: profile.avgRating,
        topGenres: profile.topGenres.map(g => g.genre)
      }
    };
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate recommendations. Please try again.',
      recommendations: []
    };
  }
}

/**
 * Formats recommendations for display with priority sorting
 */
export function formatRecommendationsForDisplay(recommendations) {
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Analyzes reading patterns to provide insights
 */
export function analyzeReadingPatterns(books) {
  const finishedBooks = books.filter(b => b.status === 'Finished');
  
  if (finishedBooks.length === 0) {
    return null;
  }

  const patterns = {
    favoriteGenre: null,
    readingPace: null,
    ratingTrend: null,
    favoriteAuthor: null
  };

  // Find favorite genre
  const genreCounts = {};
  finishedBooks.forEach(b => {
    if (b.genre) {
      genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    }
  });
  patterns.favoriteGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Find favorite author
  const authorCounts = {};
  finishedBooks.forEach(b => {
    if (b.author) {
      authorCounts[b.author] = (authorCounts[b.author] || 0) + 1;
    }
  });
  patterns.favoriteAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Calculate reading pace
  if (finishedBooks.length > 1) {
    const dates = finishedBooks
      .map(b => new Date(b.dateFinished || b.dateAdded))
      .sort((a, b) => a - b);
    const daysDiff = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
    const booksPerMonth = ((finishedBooks.length - 1) / (daysDiff / 30)).toFixed(1);
    patterns.readingPace = `${booksPerMonth} books/month`;
  }

  return patterns;
}
