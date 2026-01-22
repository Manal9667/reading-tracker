import React, {useState, useEffect, useMemo} from 'react';
import {BookOpen, Plus, Trash2, Star, Edit2, X, Library, Search, TrendingUp, Download, Upload, Target, Calendar, Award, Sparkles, AlertCircle} from 'lucide-react';
import {LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {getAIRecommendations, analyzeReadingPatterns} from './services/recommendationService';

export default function ReadingTracker() {
  const [books, setBooks] = useState([]);
  const [playlists, setPlaylists] = useState(['Currently Reading', 'To Be Read', 'Finished']);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState('All Books');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [yearlyGoal, setYearlyGoal] = useState(50);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('To Be Read');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [bookCover, setBookCover] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchingCover, setSearchingCover] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [pages, setPages] = useState('');
  const [genre, setGenre] = useState('');
  const [dateFinished, setDateFinished] = useState('');
  
  // Advanced filters
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedBooks = localStorage.getItem('reading-tracker-books');
      const savedPlaylists = localStorage.getItem('reading-tracker-playlists');
      const savedGoal = localStorage.getItem('reading-tracker-goal');
      
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      }
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      }
      if (savedGoal) {
        setYearlyGoal(parseInt(savedGoal));
      }
    } catch (error) {
      console.log('Starting fresh');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBooks = (updatedBooks) => {
    localStorage.setItem('reading-tracker-books', JSON.stringify(updatedBooks));
  };

  const savePlaylists = (updatedPlaylists) => {
    localStorage.setItem('reading-tracker-playlists', JSON.stringify(updatedPlaylists));
  };

  const saveGoal = (goal) => {
    localStorage.setItem('reading-tracker-goal', goal.toString());
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setStatus('To Be Read');
    setRating(0);
    setReview('');
    setSelectedPlaylists([]);
    setEditingBook(null);
    setBookCover('');
    setPages('');
    setGenre('');
    setDateFinished('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    if (editingBook) {
      const updatedBooks = books.map(book => 
        book.id === editingBook.id 
          ? { ...book, title, author, status, rating, review, playlists: selectedPlaylists, cover: bookCover, pages: pages ? parseInt(pages) : null, genre, dateFinished}
          : book
      );
      setBooks(updatedBooks);
      saveBooks(updatedBooks);
    } else {
      const newBook = {
        id: Date.now(),
        title,
        author,
        status,
        rating,
        review,
        playlists: selectedPlaylists,
        cover: bookCover,
        dateAdded: new Date().toISOString(),
        pages: pages ? parseInt(pages) : null,
        genre,
        dateFinished: status === 'Finished' ? (dateFinished || new Date().toISOString()) : null
      };
      const updatedBooks = [newBook, ...books];
      setBooks(updatedBooks);
      saveBooks(updatedBooks);
    }
    
    setShowAddBook(false);
    resetForm();
  };

  const deleteBook = (id) => {
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  const startEdit = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setRating(book.rating);
    setReview(book.review);
    setSelectedPlaylists(book.playlists || []);
    setBookCover(book.cover || '');
    setPages(book.pages ? book.pages.toString() : '');
    setGenre(book.genre || '');
    setDateFinished(book.dateFinished ? book.dateFinished.split('T')[0] : '');
    setShowAddBook(true);
  };

  const togglePlaylistSelection = (playlist) => {
    if (selectedPlaylists.includes(playlist)) {
      setSelectedPlaylists(selectedPlaylists.filter(p => p !== playlist));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlist]);
    }
  };

  const createPlaylist = () => {
    if (newPlaylistName.trim() && !playlists.includes(newPlaylistName.trim())){
      const updatedPlaylists = [...playlists, newPlaylistName.trim()];
      setPlaylists(updatedPlaylists);
      savePlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
    }
  };

  const deletePlaylist = (playlistName) => {
    if (['Currently Reading', 'To Be Read', 'Finished'].includes(playlistName)){
      return;
    }
    const updatedPlaylists = playlists.filter(p => p !== playlistName);
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);

    const updatedBooks = books.map(book => ({
      ...book,
      playlists: book.playlists ? book.playlists.filter(p => p !== playlistName) : []
    }));
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  const searchBookCover = async (bookTitle) => {
    if (!bookTitle.trim()) return;
    
    setSearchingCover(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitle)}&limit=1`
      );
      const data = await response.json();
      
      if (data.docs && data.docs.length > 0) {
        const book = data.docs[0];
        if (book.cover_i) {
          const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
          setBookCover(coverUrl);
        }
        if (!author && book.author_name && book.author_name.length > 0) {
          setAuthor(book.author_name[0]);
        }
        if (!pages && book.number_of_pages_median) {
          setPages(book.number_of_pages_median.toString());
        }
        if (!genre && book.subject && book.subject.length > 0) {
          setGenre(book.subject[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching book cover:', error);
    } finally {
      setSearchingCover(false);
    }
  };

  const getRecommendations = async () => {
    setLoadingRecs(true);
    setRecommendations([]);
    
    try {
      // Call AI-powered recommendation service
      const result = await getAIRecommendations(books);
      
      if (result.success) {
        setRecommendations(result.recommendations);
      } else {
        // Fallback to basic recommendations if no AI is configured
        console.log('Using basic recommendations:', result.message);
        
        // Get top-rated books
        const topBooks = books.filter(b => b.rating >= 4 && b.genre);
        
        if (topBooks.length === 0) {
          setRecommendations([]);
          setLoadingRecs(false);
          return;
        }
        
        // Get genres from top books
        const genres = [...new Set(topBooks.map(b => b.genre).filter(Boolean))];
        
        // Search for books in similar genres
        const recs = [];
        for (const genre of genres.slice(0, 2)) {
          try {
            const response = await fetch(
              `https://openlibrary.org/search.json?subject=${encodeURIComponent(genre)}&limit=5`
            );
            const data = await response.json();
            
            if (data.docs) {
              data.docs.forEach(book => {
                if (!books.find(b => b.title === book.title)) {
                  recs.push({
                    title: book.title,
                    author: book.author_name?.[0] || 'Unknown',
                    cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
                    genre: genre,
                    pages: book.number_of_pages_median,
                    whyRecommended: `Similar to books you enjoyed in the ${genre} genre.`,
                    matchScore: 75
                  });
                }
              });
            }
          } catch (err) {
            console.error('Error fetching recommendations:', err);
          }
        }
        
        setRecommendations(recs.slice(0, 6));
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
    }
  };

  const addRecommendedBook = (rec) => {
    const newBook = {
      id: Date.now(),
      title: rec.title,
      author: rec.author,
      status: 'To Be Read',
      rating: 0,
      review: '',
      playlists: [],
      cover: rec.cover,
      dateAdded: new Date().toISOString(),
      pages: rec.pages,
      genre: rec.genre,
      dateFinished: null
    };
    const updatedBooks = [newBook, ...books];
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
    setRecommendations(recommendations.filter(r => r.title !== rec.title));
  };

  const exportData = () => {
    const dataStr = JSON.stringify({books, playlists, yearlyGoal}, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reading-library-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.books) {
            setBooks(data.books);
            saveBooks(data.books);
          }
          if (data.playlists) {
            setPlaylists(data.playlists);
            savePlaylists(data.playlists);
          }
          if (data.yearlyGoal) {
            setYearlyGoal(data.yearlyGoal);
            saveGoal(data.yearlyGoal);
          }
        } catch (error) {
          alert('Error importing data. Please check file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredBooks = useMemo(() => {
    let filtered = selectedPlaylist === 'All Books' 
      ? books 
      : selectedPlaylist === 'Currently Reading' || selectedPlaylist === 'To Be Read' || selectedPlaylist === 'Finished'
      ? books.filter(book => book.status === selectedPlaylist)
      : books.filter(book => book.playlists && book.playlists.includes(selectedPlaylist));
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.genre && book.genre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Advanced filters
    filtered = filtered.filter(book => {
      if (book.rating < minRating || book.rating > maxRating) return false;
      if (dateFrom && book.dateAdded && new Date(book.dateAdded) < new Date(dateFrom)) return false;
      if (dateTo && book.dateAdded && new Date(book.dateAdded) > new Date(dateTo)) return false;
      return true;
    });
    
    return filtered;
  }, [books, selectedPlaylist, searchTerm, minRating, maxRating, dateFrom, dateTo]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      switch(sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (a.author || '').localeCompare(b.author || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'dateAdded':
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });
  }, [filteredBooks, sortBy]);

  const stats = useMemo(() => ({
    total: books.length,
    finished: books.filter(b => b.status === 'Finished').length,
    reading: books.filter(b => b.status === 'Currently Reading').length,
    tbr: books.filter(b => b.status === 'To Be Read').length,
    avgRating: books.length > 0 ? (books.reduce((sum, b) => sum + (b.rating || 0), 0) / books.filter(b => b.rating > 0).length).toFixed(1) : 0,
    totalPages: books.reduce((sum, b) => sum + (b.pages || 0), 0)
  }), [books]);

  // Analytics data
  const monthlyData = useMemo(() => {
    const months = {};
    books.filter(b => b.status === 'Finished' && b.dateFinished).forEach(book => {
      const month = new Date(book.dateFinished).toLocaleString('default', {month: 'short', year: 'numeric'});
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({month, count})).slice(-6);
  }, [books]);

  const genreData = useMemo(() => {
    const genres = {};
    books.forEach(book => {
      if (book.genre) {
        genres[book.genre] = (genres[book.genre] || 0) + 1;
      }
    });
    return Object.entries(genres).map(([name, value]) => ({name, value})).slice(0, 5);
  }, [books]);

  const ratingDistribution = useMemo(() => {
    const ratings = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    books.forEach(book => {
      if (book.rating > 0) {
        ratings[book.rating] = (ratings[book.rating] || 0) + 1;
      }
    });
    return Object.entries(ratings).map(([rating, count]) => ({rating: `${rating} ★`, count}));
  }, [books]);

  const COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-amber-800 text-xl">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-12 h-12 text-pink-700" />
            <h1 className="text-5xl font-bold text-pink-900">ReadNest</h1>
          </div>
          <p className="text-amber-700 text-lg">Keep track of your latest reads, rate them and get AI-powered recommendations for your next reads!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.finished}</div>
            <div className="text-sm text-gray-600">Finished</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.reading}</div>
            <div className="text-sm text-gray-600">Reading</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.tbr}</div>
            <div className="text-sm text-gray-600">To Read</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.avgRating}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalPages.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Pages</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowAddBook(true);
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Book
          </button>
          <button
            onClick={() => setShowCreatePlaylist(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setShowGoals(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Target className="w-5 h-5" />
            Goals
          </button>
          <button
            onClick={() => {
              setShowRecommendations(true);
              getRecommendations();
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Award className="w-5 h-5" />
            Recommendations
          </button>
          <button
            onClick={exportData}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <label className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg cursor-pointer">
            <Upload className="w-5 h-5" />
            Import
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Reading Analytics</h2>
                <button onClick={() => setShowAnalytics(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Monthly Reading Trend */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Books Finished by Month</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Rating Distribution */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Rating Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ratingDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Genre Distribution */}
                {genreData.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Top Genres</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={genreData} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {genreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Goals Modal */}
        {showGoals && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reading Goals</h2>
                <button onClick={() => setShowGoals(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yearly Reading Goal
                  </label>
                  <input
                    type="number"
                    value={yearlyGoal}
                    onChange={(e) => {
                      const goal = parseInt(e.target.value) || 0;
                      setYearlyGoal(goal);
                      saveGoal(goal);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-green-700">{stats.finished} / {yearlyGoal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-600 h-4 rounded-full transition-all duration-300" 
                      style={{width: `${Math.min((stats.finished / yearlyGoal) * 100, 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {yearlyGoal - stats.finished > 0 ? `${yearlyGoal - stats.finished} books to go!` : 'Goal achieved! 🎉'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Modal */}
        {showRecommendations && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-900">AI-Powered Recommendations</h2>
                </div>
                <button onClick={() => setShowRecommendations(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loadingRecs ? (
                <div className="text-center py-8">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
                  <div className="text-gray-600">Analyzing your reading patterns and generating personalized recommendations...</div>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-2">No recommendations available</p>
                  <p className="text-gray-600 text-sm">To get personalized AI recommendations, please finish and rate at least one book with a genre in your library.</p>
                </div>
              ) : (
                <div>
                  {/* Recommendation Stats */}
                  <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-amber-900">AI Analysis:</span> Based on your reading history and preferences, we've generated 6 personalized recommendations matched to your taste.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-5 border border-gray-200 hover:border-amber-300 transition-colors">
                        <div className="flex gap-4">
                          {/* Match Score Badge */}
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {rec.matchScore || 85}%
                            </div>
                            <p className="text-xs text-gray-600 mt-1 text-center">Match</p>
                          </div>

                          {/* Book Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{rec.title}</h3>
                                <p className="text-sm text-gray-600">{rec.author}</p>
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {rec.genre}
                              </span>
                              {rec.estimatedPages && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  ~{rec.estimatedPages} pages
                                </span>
                              )}
                              {rec.source === 'claude-ai' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <Sparkles className="w-3 h-3 mr-1" /> AI Pick
                                </span>
                              )}
                            </div>

                            {/* Why Recommended */}
                            {rec.whyRecommended && (
                              <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-blue-900">Why:</span> {rec.whyRecommended}
                                </p>
                                {rec.similarTo && (
                                  <p className="text-xs text-gray-600 mt-2">
                                    <span className="font-semibold">Similar to:</span> {rec.similarTo}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Action Button */}
                            <button
                              onClick={() => addRecommendedBook(rec)}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              Add to Library
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreatePlaylist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Create Playlist</h2>
                <button
                  onClick={() => {
                    setShowCreatePlaylist(false);
                    setNewPlaylistName('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="e.g., Fantasy, Sci-Fi, Favorites"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') createPlaylist();
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createPlaylist}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreatePlaylist(false);
                      setNewPlaylistName('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Book Modal */}
        {showAddBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddBook(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book Title *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter book title"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => searchBookCover(title)}
                      disabled={searchingCover}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                    >
                      {searchingCover ? '...' : '🔍'}
                    </button>
                  </div>
                  {bookCover && (
                    <div className="mt-2">
                      <img src={bookCover} alt="Book cover" className="w-24 h-32 object-cover rounded shadow" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pages
                    </label>
                    <input
                      type="number"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="Number of pages"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="e.g., Fiction, Mystery"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option>To Be Read</option>
                    <option>Currently Reading</option>
                    <option>Finished</option>
                  </select>
                </div>

                {status === 'Finished' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Finished
                    </label>
                    <input
                      type="date"
                      value={dateFinished}
                      onChange={(e) => setDateFinished(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review / Notes
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="What did you think about this book?"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add to Playlists (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {playlists.filter(p => p !== 'Currently Reading' && p !== 'To Be Read' && p !== 'Finished').map((playlist) => (
                      <button
                        key={playlist}
                        type="button"
                        onClick={() => togglePlaylistSelection(playlist)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedPlaylists.includes(playlist)
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {playlist}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {editingBook ? 'Update Book' : 'Add Book'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddBook(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {books.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-amber-700 hover:text-amber-800 font-medium mb-2"
            >
              {showAdvancedFilters ? '− Hide' : '+ Show'} Advanced Filters
            </button>
            
            {showAdvancedFilters && (
              <div className="bg-white rounded-lg shadow p-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="0">Any</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Rating</label>
                  <select
                    value={maxRating}
                    onChange={(e) => setMaxRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="5">Any</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        {books.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, or genre..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow"
              />
            </div>
          </div>
        )}

        {/* Sort Options */}
        {books.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow"
            >
              <option value="dateAdded">Date Added (Newest)</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
              <option value="rating">Rating (Highest)</option>
            </select>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPlaylist('All Books')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPlaylist === 'All Books'
                ? 'bg-amber-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Books
          </button>
          {playlists.map((playlist) => (
            <div key={playlist} className="relative group">
              <button
                onClick={() => setSelectedPlaylist(playlist)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPlaylist === playlist
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {playlist}
              </button>
              {!['Currently Reading', 'To Be Read', 'Finished'].includes(playlist) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist(playlist);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete playlist"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Books Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedBooks.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
              <Library className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No books match your filters</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          )}

          {sortedBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow"
            >
              {book.cover && (
                <img 
                  src={book.cover} 
                  alt={book.title}
                  className="w-full h-48 object-cover rounded-t-lg mb-3"
                />
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{book.author || 'Unknown Author'}</p>
                  {book.pages && <p className="text-gray-500 text-xs">{book.pages} pages</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(book)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteBook(book.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  book.status === 'Finished' ? 'bg-green-100 text-green-800' :
                  book.status === 'Currently Reading' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {book.status}
                </span>
                {book.genre && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {book.genre}
                  </span>
                )}
              </div>

              {book.rating > 0 && (
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= book.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {book.review && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">{book.review}</p>
              )}

              {book.playlists && book.playlists.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {book.playlists.map((playlist) => (
                    <span
                      key={playlist}
                      className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs"
                    >
                      {playlist}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Added {new Date(book.dateAdded).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center py-6 border-t border-gray-200">
          <p className="text-gray-600">
            Built with React by <span className="font-semibold text-amber-700">Manal Khan</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">UWaterloo CFM 2026</p>
        </div>
      </div>
    </div>
  );
}