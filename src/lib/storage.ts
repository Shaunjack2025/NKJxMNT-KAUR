export interface SavedSession {
  roomCode: string;
  roomId: string;
  playerNumber: 1 | 2;
  playerName: string;
  sessionToken: string;
}

const STORAGE_KEY = 'nkj_mnt_session';

export function savePlayerSession(session: SavedSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to save session to localStorage', e);
  }
}

export function getSavedSession(roomCode?: string): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: SavedSession = JSON.parse(raw);
    if (roomCode && session.roomCode.toLowerCase() !== roomCode.toLowerCase()) {
      return null;
    }
    return session;
  } catch (e) {
    console.warn('Failed to parse saved session', e);
    return null;
  }
}

export function clearSavedSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear session', e);
  }
}
