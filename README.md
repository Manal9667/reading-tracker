# 📚 ReadNest - AI-Powered Reading Tracker

ReadNest is a modern reading tracker with intelligent AI recommendations powered by Claude API. Track your books, analyze your reading habits and discover your next favorite read.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![Claude AI](https://img.shields.io/badge/Claude-3.5%20Sonnet-purple)

## ✨ Features

### 📖 Book Management
- Add, edit, and organize your reading library
- Track reading status (To Be Read, Currently Reading, Finished)
- Rate books with 1-5 stars and write reviews
- Create custom playlists and collections
- Auto-fetch book covers from OpenLibrary

### 🤖 AI Recommendations
- Get personalized book suggestions powered by Claude 3.5 Sonnet
- Match scores show how well recommendations fit your taste
- Contextual explanations for each recommendation
- Learns from your reading history and preferences

### 📊 Analytics & Insights
- Visual charts showing monthly reading trends
- Rating distribution and genre breakdown
- Track reading goals with progress visualization
- Detailed statistics (total books, pages read, average rating)

### 🔍 Search & Filter
- Advanced search by title, author, or genre
- Filter by rating, date range, and status
- Sort by date, title, author, or rating

### 💾 Data Management
- Export your library as JSON
- Import previously exported data
- All data stored locally in your browser (privacy-first)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Claude API key (optional, for AI recommendations)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/reading-tracker.git
cd reading-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### AI Recommendations Setup (Optional)

1. Get a Claude API key from [console.anthropic.com](https://console.anthropic.com/)
2. Create `.env.local` in the project root:
   ```env
   VITE_CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```
3. Restart the dev server
4. Add some books with ratings and genres, then click "Recommendations"

> **Note:** The app works perfectly without an API key! You'll get basic recommendations using OpenLibrary API instead.

## 📖 Usage

### Adding Books
1. Click **"Add Book"** button
2. Enter book details (title, author, genre, pages, etc.)
3. Use the search icon to auto-fetch cover and metadata
4. Set status and rating when finished
5. Save - it's automatically stored in your browser

### Getting AI Recommendations
1. Add at least 2-3 finished books with ratings
2. Click **"Recommendations"** button
3. View personalized suggestions with match scores
4. Click "Add to Library" to save recommendations

### Viewing Analytics
- Click **"Analytics"** to see reading trends and statistics
- Click **"Goals"** to set and track yearly reading targets

## 🛠️ Tech Stack

- **React 19.2** - UI library
- **Vite 7.2** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Recharts 3.6** - Data visualization
- **Claude API** - AI recommendations
- **OpenLibrary API** - Book metadata

## 🎨 Features in Detail

### AI Recommendation Engine
The recommendation system analyzes your reading profile:
- Favorite genres and authors
- Rating patterns and preferences
- Book length preferences
- Recent reading activity

It then uses Claude AI to generate 6 personalized recommendations with explanations.

### Privacy & Security
- ✅ All data stored locally in your browser
- ✅ No server-side storage
- ✅ API keys never exposed
- ✅ No tracking or analytics
- ✅ Export/import for backup

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 🚧 In Progress

- Building a Node.js backend with MongoDB to support user authentication and cross-device sync  
- Exploring backend architecture patterns, API design, and database modeling through hands-on development

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 👨‍💻 Author

**Manal Khan**
- UWaterloo, 2026

**⭐ If you find this project useful, please consider giving it a star!**
