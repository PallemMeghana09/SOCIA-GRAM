/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Timestamp } from 'firebase/firestore';

export interface Issue {
  id: string;
  category: string;
  description: string;
  photoUrl: string; // Base64 compressed image data URL
  latitude: number;
  longitude: number;
  landmarkNote?: string;
  reporterName?: string;
  reporterPhone?: string;
  aadhaarNumber?: string;
  status: 'Submitted' | 'In Progress' | 'Resolved';
  resolutionNote?: string;
  resolutionPhotoUrl?: string; // Base64 compressed resolved image data URL
  submittedByUid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  reportType?: 'civic' | 'transport';
  villageName?: string;
  cityName?: string;
  pinCode?: string;
}

export type ViewMode = 'citizen' | 'admin';

export type Language = 'en' | 'te' | 'hi';
