export type UserPlan =
  | 'free' | 'liga' | 'pro' | 'master'
  | 'golzair' | 'partner' | 'business'
  | 'gold' | 'golzi premium';

export type BroadcastMediaType = 'text' | 'image' | 'video';

export interface Broadcast {
  id: string;
  ligaId: string;
  message: string;
  mediaUrl?: string;
  mediaType?: BroadcastMediaType;
  authorId: string;
  authorName: string;
  pinned: boolean;
  createdAt: any;
}
