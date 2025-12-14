export type Category = "All" | "Portrait" | "Travel" | "Editorial";

export interface Photo {
  id: string;
  src: string;
  alt: string;
  category: Category;
  width: number;
  height: number;
  location?: string;
  date?: string;
}

export const photos: Photo[] = [
  {
    id: "1",
    src: "/images/portrait-1.jpg",
    alt: "Windblown Portrait",
    category: "Portrait",
    width: 800,
    height: 1200,
    location: "Taipei",
    date: "2024.03"
  },
  {
    id: "2",
    src: "/images/travel-1.jpg",
    alt: "Tokyo Night Rain",
    category: "Travel",
    width: 1200,
    height: 800,
    location: "Shinjuku",
    date: "2023.11"
  },
  {
    id: "3",
    src: "/images/editorial-1.jpg",
    alt: "Hand with Flower",
    category: "Editorial",
    width: 800,
    height: 1200,
    location: "Studio A",
    date: "2024.01"
  },
  {
    id: "4",
    src: "/images/cat-1.jpg",
    alt: "Cat Eye",
    category: "Editorial",
    width: 1000,
    height: 1000,
    location: "Home",
    date: "2024.02"
  },
  // Placeholders to fill the grid
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1000&auto=format&fit=crop",
    alt: "Urban Architecture",
    category: "Travel",
    width: 800,
    height: 1000,
    location: "Tokyo",
    date: "2023.12"
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
    alt: "Shadow Play",
    category: "Portrait",
    width: 1000,
    height: 800,
    location: "Taipei",
    date: "2024.01"
  },
  {
    id: "7",
    src: "https://images.unsplash.com/photo-1552168324-d612d77725e3?q=80&w=1000&auto=format&fit=crop",
    alt: "Film Camera",
    category: "Editorial",
    width: 800,
    height: 800,
    location: "Studio",
    date: "2023.10"
  },
  {
    id: "8",
    src: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=1000&auto=format&fit=crop",
    alt: "Street Silhouette",
    category: "Travel",
    width: 1200,
    height: 800,
    location: "Shibuya",
    date: "2023.11"
  },
  {
    id: "9",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    alt: "Moody Portrait",
    category: "Portrait",
    width: 800,
    height: 1200,
    location: "Taipei",
    date: "2024.02"
  },
  {
    id: "10",
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
    alt: "Camera Lens",
    category: "Editorial",
    width: 1000,
    height: 600,
    location: "Studio",
    date: "2024.01"
  },
  {
    id: "11",
    src: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1000&auto=format&fit=crop",
    alt: "Fashion Shoot",
    category: "Portrait",
    width: 800,
    height: 1000,
    location: "Tokyo",
    date: "2023.12"
  },
  {
    id: "12",
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop",
    alt: "Night Lights",
    category: "Travel",
    width: 1200,
    height: 800,
    location: "Osaka",
    date: "2023.11"
  }
];

export const reviews = [
  {
    id: 1,
    name: "Sarah L.",
    text: "26phi captured the essence of my brand perfectly. The raw emotion in the photos is unmatched.",
    role: "Fashion Designer"
  },
  {
    id: 2,
    name: "Kenji T.",
    text: "Working with 26phi in Tokyo was a dream. Professional, artistic, and the results speak for themselves.",
    role: "Musician"
  },
  {
    id: 3,
    name: "Elena R.",
    text: "I've never felt so comfortable in front of a camera. The photos are my favorite portraits ever taken.",
    role: "Model"
  }
];
