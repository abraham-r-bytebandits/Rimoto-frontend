export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type RideStatus = "PENDING" | "APPROVED" | "REJECTED";
export type StoryStatus = "PENDING" | "APPROVED" | "REJECTED";
export type UserRole = "USER" | "ADMIN";
export type FeaturedSlot = "HERO_BANNER";
export type TabId = "dashboard" | "rides" | "stories" | "published" | "featured" | "routes" | "users" | "claims";

export interface Organizer {
  firstName: string;
  lastName: string;
  clubAffiliation?: string;
  contactNumber?: string;
}

export interface Ride {
  id: string;
  title: string;
  startLocation: string;
  endLocation: string;
  dateScheduled: string;
  timeStart: string;
  distanceKm: number;
  skillLevel: SkillLevel;
  bikeRequirement: string;
  whatsappJoinsCount: number;
  organizer: Organizer;
  createdAt: string;
  status: RideStatus;
  featuredSlot?: FeaturedSlot | null;
  imageUrls?: string[];
}

export interface Story {
  id: string;
  title: string;
  destinationTag: string;
  flairType: string;
  mediaMeta: { photos: number; videos: number };
  status: StoryStatus;
  postType: "STORY" | "REVIEW";
  images?: string[];
  contentBody: string;
  author: { firstName: string; lastName: string; avatarUrl?: string };
  createdAt: string;
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  strikeCount: number;
  clubAffiliation?: string;
  contactNumber?: string;
  joinedAt: string;
}

export interface Metrics {
  pendingRides: number;
  publishedRides: number;
  totalRiders: number;
  pendingStories: number;
}

export interface Activity {
  id: number;
  message: string;
  actionSeverity: "SUCCESS" | "WARNING" | "DEFAULT";
  createdAt: string;
}