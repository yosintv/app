
export type SportType = 'Cricket' | 'Football';

export interface Match {
  team1: string;
  team2: string;
  team1_logo: string;
  team2_logo: string;
  league: string;
  category: string;
  start: string;
  duration: number;
  details_url: string;
  sport: SportType;
  venue?: string;
  matchId?: number;
  stadium?: string;
  referee?: string;
  home_lineup?: string[];
  away_lineup?: string[];
}

export interface MatchEvent {
  name: string;
  link?: string;
  links?: string[];
}

export interface StreamData {
  events: MatchEvent[];
  styles?: {
    livee: string;
    liveeHover: string;
    liveeName: string;
  };
}

export interface Highlight {
  id: string;
  team1: string;
  team2: string;
  category: string;
  date: string;
  link: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  imageUrl: string;
}

export enum AppScreen {
  Matches = 'Matches',
  Highlights = 'Highlights',
  News = 'News',
  MatchDetails = 'MatchDetails'
}

export interface AlertChannel {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  icon: string;
  url: string;
  cta_text: string;
  enabled: boolean;
  priority: number;
}

export interface AlertData {
  status: string;
  last_updated: string;
  daily_message: string;
  show_frequency: {
    app_open: boolean;
    once_per_day: boolean;
    cooldown_hours: number;
  };
  channels: AlertChannel[];
  ui_config: {
    display_type: string;
    dismissible: boolean;
    auto_close_seconds: number;
    theme: string;
  };
}
