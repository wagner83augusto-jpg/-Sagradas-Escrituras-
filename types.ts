export interface Book {
  name: string;
  testament: 'Old' | 'New';
  chapters: number;
}

export interface Verse {
  verse: number;
  text: string;
}

export type ViewState = 'landing' | 'menu' | 'bible' | 'dictionary';

export type BibleViewState = 'books' | 'chapters' | 'verses';

export type BibleVersion = 'ACF' | 'ARA' | 'NVI' | 'NTLH';

export interface ChapterData {
  book: string;
  chapter: number;
  verses: Verse[];
}

// Key format: "BookName-Chapter-Verse" (e.g., "Gênesis-1-1")
export type UserNotesMap = Record<string, string>;

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  url: string; // Stream URL
  color: string;
}