/** Celebrity / league supporter video messages (public/static). */

export type CelebritySupportVideo = {
  id: string;
  src: string;
  title: string;
  subtitle: string;
};

export const CELEBRITY_SUPPORT_VIDEOS: CelebritySupportVideo[] = [
  {
    id: "support-1",
    src: "/videos/celebrity-support/celebrity-support-1.mp4",
    title: "Yuzvendra Chahal",
    subtitle: "India leg-spinner · Future Star U-15 supporter",
  },
  {
    id: "support-2",
    src: "/videos/celebrity-support/celebrity-support-2.mp4",
    title: "Mr. Aakash Chopra",
    subtitle: "Former India opener · League supporter",
  },
  {
    id: "support-3",
    src: "/videos/celebrity-support/celebrity-support-3.mp4",
    title: "Piyush Chawla",
    subtitle: "India World Cup-winning spinner · League supporter",
  },
];

export const CELEBRITY_WELCOME_STORAGE_KEY = "fs_u15_celebrity_welcome_seen_v1";

export function pickRandomCelebrityVideo(): CelebritySupportVideo {
  const index = Math.floor(Math.random() * CELEBRITY_SUPPORT_VIDEOS.length);
  return CELEBRITY_SUPPORT_VIDEOS[index]!;
}
