
import { Timestamp } from '@firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp;
  progressCount?: number;
  lastUpdated?: Timestamp;
  pinned?: boolean;
}

export interface ProgressReport {
  id: string;
  date: Timestamp;
  progress: string;
  nextStep: string;
  lastModified?: Timestamp;
}