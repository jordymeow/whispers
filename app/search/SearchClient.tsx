'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { BackgroundProvider } from '@/components/BackgroundProvider';
import styles from './page.module.css';

interface UserResult {
  username: string;
  displayName: string;
  bio?: string;
  backgroundTint?: string;
  profileUrl: string;
  asciiArtBanner?: string;
}

interface SearchResponse {
  query: string;
  results: UserResult[];
  count: number;
}

export default function SearchClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  return (
    <BackgroundProvider backgroundTheme="northern_lights" backgroundTint="blue">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '5rem 0 3rem' }} className="animate-fade-up">
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Search size={48} style={{ opacity: 0.3 }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--text-tertiary)',
              margin: 0,
              fontSize: '0.75rem',
            }}>
              Discover
            </p>
            <h1
              style={{
                fontSize: '36px',
                fontFamily: 'var(--font-title)',
                fontWeight: 400,
                margin: '0 0 2rem 0',
              }}
            >
              Find Whisperers
            </h1>

            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by username or display name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
            </div>

            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-tertiary)',
                marginTop: '1rem'
              }}>
                Type at least 2 characters to search...
              </p>
            )}
          </div>
        </header>

        <main style={{ flex: 1, paddingBottom: '4rem' }}>
          <div className="container">
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>Searching...</p>
              </div>
            )}

            {hasSearched && !isLoading && results.length === 0 && searchQuery.length >= 2 && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>
                  No users found matching "{searchQuery}"
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className={styles.resultsGrid}>
                {results.map((user) => (
                  <Link
                    key={user.username}
                    href={user.profileUrl}
                    className={styles.userCard}
                  >
                    <div className={styles.cardHeader}>
                      {user.asciiArtBanner ? (
                        <pre className={styles.asciiArt}>
                          {user.asciiArtBanner}
                        </pre>
                      ) : (
                        <div className={styles.userIcon}>
                          <User size={24} />
                        </div>
                      )}
                    </div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.displayName}>{user.displayName}</h3>
                      <p className={styles.username}>@{user.username}</p>
                      {user.bio && (
                        <p className={styles.userBio}>{user.bio}</p>
                      )}
                    </div>
                    <div className={styles.cardFooter}>
                      View Profile →
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </BackgroundProvider>
  );
}