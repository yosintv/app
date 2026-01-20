
import { API_URLS } from '../constants';
import { Match, Highlight, NewsArticle, SportType, StreamData } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const FETCH_TIMEOUT = 10000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const getMatches = async (): Promise<Match[]> => {
  try {
    const results = await Promise.allSettled([
      fetchWithTimeout(API_URLS.cricket).then(res => res.json()),
      fetchWithTimeout(API_URLS.football).then(res => res.json())
    ]);

    const cricketData = results[0].status === 'fulfilled' ? results[0].value : [];
    const footballData = results[1].status === 'fulfilled' ? results[1].value : [];

    const mapMatchData = (data: any, sport: SportType): Match[] => {
      const list = Array.isArray(data) ? data : (data?.matches || []);
      
      return list.map((m: any) => {
        const duration = typeof m.duration === 'string' ? parseFloat(m.duration) : (m.duration || 0);
        return {
          team1: m.team1 || 'TBC',
          team2: m.team2 || 'TBC',
          team1_logo: m.team1_logo || `https://ui-avatars.com/api/?name=${m.team1 || 'T1'}&background=random`,
          team2_logo: m.team2_logo || `https://ui-avatars.com/api/?name=${m.team2 || 'T2'}&background=random`,
          league: m.league || (sport === 'Cricket' ? 'Cricket Tournament' : 'Football League'),
          category: m.category || sport,
          start: m.start || m.start_time || new Date().toISOString(),
          duration: duration,
          details_url: m.details_url || '#',
          sport: sport,
          venue: m.venue || m.stadium || 'International Stadium',
          // New advanced data mapping
          matchId: m.matchId,
          stadium: m.stadium,
          referee: m.referee,
          home_lineup: m.home_lineup,
          away_lineup: m.away_lineup
        };
      });
    };

    const formattedCricket = mapMatchData(cricketData, 'Cricket');
    const formattedFootball = mapMatchData(footballData, 'Football');

    return [...formattedCricket, ...formattedFootball];
  } catch (error) {
    console.error('Error in getMatches:', error);
    throw new Error('Could not fetch matches. Check internet.');
  }
};

export const getMatchStreams = async (slug: string): Promise<StreamData> => {
  try {
    const url = `https://blog.cricfoot.net/${slug}.json`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return { events: [] };
    return await res.json();
  } catch (error) {
    console.error('Error in getMatchStreams:', error);
    // Return empty events instead of throwing to keep the UI functional
    return { events: [] };
  }
};

export const getHighlights = async (): Promise<Highlight[]> => {
  try {
    const res = await fetchWithTimeout(API_URLS.highlights);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data?.highlights || []);
    return list.map((h: any) => ({
      ...h,
      team1: h.team1 || 'Team A',
      team2: h.team2 || 'Team B',
      date: h.date || 'TBD'
    }));
  } catch (error) {
    console.error('Error fetching highlights:', error);
    throw new Error('Video highlights are currently unavailable.');
  }
};

export const getNews = async (): Promise<NewsArticle[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Generate 10 latest sports news articles (Cricket and Football).',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              publishedAt: { type: Type.STRING, description: 'ISO date string' },
              imageUrl: { type: Type.STRING }
            },
            required: ['id', 'title', 'summary', 'source', 'publishedAt', 'imageUrl']
          }
        }
      }
    });

    const jsonStr = response.text?.trim() || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('News AI generation failed:', error);
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `fallback-${i}`,
      title: 'Breaking: Major Tournament Update',
      summary: 'Stay tuned as we bring you more updates on the ongoing matches and player performances from around the globe.',
      source: 'YoSinTV News',
      publishedAt: new Date().toISOString(),
      imageUrl: `https://picsum.photos/seed/${i + 40}/800/400`
    }));
  }
};
