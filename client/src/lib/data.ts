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
    "id": "1",
    "src": "/images/portfolio/portrait/KILLER_\u5287\u7167_10.jpg",
    "alt": "Portrait Photo 1",
    "category": "Portrait",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "2",
    "src": "/images/portfolio/portrait/KILLER_\u5287\u7167_101.jpg",
    "alt": "Portrait Photo 2",
    "category": "Portrait",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "3",
    "src": "/images/portfolio/portrait/KILLER_\u5287\u7167_1.jpg",
    "alt": "Portrait Photo 3",
    "category": "Portrait",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "4",
    "src": "/images/portfolio/portrait/KILLER_\u5287\u7167_100.jpg",
    "alt": "Portrait Photo 4",
    "category": "Portrait",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "5",
    "src": "/images/portfolio/travel/_A1_8970.jpg",
    "alt": "Travel Photo 5",
    "category": "Travel",
    "width": 800,
    "height": 1200,
    "location": "Tokyo",
    "date": "2025"
  },
  {
    "id": "6",
    "src": "/images/portfolio/travel/_A1_8993.jpg",
    "alt": "Travel Photo 6",
    "category": "Travel",
    "width": 800,
    "height": 1200,
    "location": "Tokyo",
    "date": "2025"
  },
  {
    "id": "7",
    "src": "/images/portfolio/travel/_A1_8994.jpg",
    "alt": "Travel Photo 7",
    "category": "Travel",
    "width": 800,
    "height": 1200,
    "location": "Tokyo",
    "date": "2025"
  },
  {
    "id": "8",
    "src": "/images/portfolio/editorial/XRAGE_01_10.jpg",
    "alt": "Editorial Photo 8",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "9",
    "src": "/images/portfolio/editorial/XRAGE_01_1.jpg",
    "alt": "Editorial Photo 9",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "10",
    "src": "/images/portfolio/editorial/XRAGE_01_11.jpg",
    "alt": "Editorial Photo 10",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "11",
    "src": "/images/portfolio/editorial/XRAGE_01_2.jpg",
    "alt": "Editorial Photo 11",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "12",
    "src": "/images/portfolio/editorial/XRAGE_01_3.jpg",
    "alt": "Editorial Photo 12",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "13",
    "src": "/images/portfolio/editorial/XRAGE_01_12.jpg",
    "alt": "Editorial Photo 13",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "14",
    "src": "/images/portfolio/editorial/XRAGE_01_4.jpg",
    "alt": "Editorial Photo 14",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "15",
    "src": "/images/portfolio/editorial/XRAGE_01_6.jpg",
    "alt": "Editorial Photo 15",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "16",
    "src": "/images/portfolio/editorial/XRAGE_01_7.jpg",
    "alt": "Editorial Photo 16",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "17",
    "src": "/images/portfolio/editorial/XRAGE_01_5.jpg",
    "alt": "Editorial Photo 17",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "18",
    "src": "/images/portfolio/editorial/XRAGE_01_8.jpg",
    "alt": "Editorial Photo 18",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "19",
    "src": "/images/portfolio/editorial/XRAGE_02_1.jpg",
    "alt": "Editorial Photo 19",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "20",
    "src": "/images/portfolio/editorial/XRAGE_01_9.jpg",
    "alt": "Editorial Photo 20",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "21",
    "src": "/images/portfolio/editorial/XRAGE_02_10.jpg",
    "alt": "Editorial Photo 21",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "22",
    "src": "/images/portfolio/editorial/XRAGE_02_11.jpg",
    "alt": "Editorial Photo 22",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "23",
    "src": "/images/portfolio/editorial/XRAGE_02_13.jpg",
    "alt": "Editorial Photo 23",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "24",
    "src": "/images/portfolio/editorial/XRAGE_02_12.jpg",
    "alt": "Editorial Photo 24",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "25",
    "src": "/images/portfolio/editorial/XRAGE_02_14.jpg",
    "alt": "Editorial Photo 25",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "26",
    "src": "/images/portfolio/editorial/XRAGE_02_17.jpg",
    "alt": "Editorial Photo 26",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "27",
    "src": "/images/portfolio/editorial/XRAGE_02_16.jpg",
    "alt": "Editorial Photo 27",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "28",
    "src": "/images/portfolio/editorial/XRAGE_02_15.jpg",
    "alt": "Editorial Photo 28",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "29",
    "src": "/images/portfolio/editorial/XRAGE_02_2.jpg",
    "alt": "Editorial Photo 29",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "30",
    "src": "/images/portfolio/editorial/XRAGE_02_3.jpg",
    "alt": "Editorial Photo 30",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "31",
    "src": "/images/portfolio/editorial/XRAGE_02_4.jpg",
    "alt": "Editorial Photo 31",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "32",
    "src": "/images/portfolio/editorial/XRAGE_02_5.jpg",
    "alt": "Editorial Photo 32",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "33",
    "src": "/images/portfolio/editorial/XRAGE_02_6.jpg",
    "alt": "Editorial Photo 33",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "34",
    "src": "/images/portfolio/editorial/XRAGE_02_7.jpg",
    "alt": "Editorial Photo 34",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "35",
    "src": "/images/portfolio/editorial/XRAGE_02_8.jpg",
    "alt": "Editorial Photo 35",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "36",
    "src": "/images/portfolio/editorial/XRAGE_02_9.jpg",
    "alt": "Editorial Photo 36",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "37",
    "src": "/images/portfolio/editorial/XRAGE_03_1.jpg",
    "alt": "Editorial Photo 37",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "38",
    "src": "/images/portfolio/editorial/XRAGE_03_10.jpg",
    "alt": "Editorial Photo 38",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "39",
    "src": "/images/portfolio/editorial/XRAGE_03_11.jpg",
    "alt": "Editorial Photo 39",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "40",
    "src": "/images/portfolio/editorial/XRAGE_03_12.jpg",
    "alt": "Editorial Photo 40",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "41",
    "src": "/images/portfolio/editorial/XRAGE_03_13.jpg",
    "alt": "Editorial Photo 41",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "42",
    "src": "/images/portfolio/editorial/XRAGE_03_14.jpg",
    "alt": "Editorial Photo 42",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "43",
    "src": "/images/portfolio/editorial/XRAGE_03_2.jpg",
    "alt": "Editorial Photo 43",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "44",
    "src": "/images/portfolio/editorial/XRAGE_03_15.jpg",
    "alt": "Editorial Photo 44",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "45",
    "src": "/images/portfolio/editorial/XRAGE_03_3.jpg",
    "alt": "Editorial Photo 45",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "46",
    "src": "/images/portfolio/editorial/XRAGE_03_5.jpg",
    "alt": "Editorial Photo 46",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "47",
    "src": "/images/portfolio/editorial/XRAGE_03_4.jpg",
    "alt": "Editorial Photo 47",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "48",
    "src": "/images/portfolio/editorial/XRAGE_03_7.jpg",
    "alt": "Editorial Photo 48",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "49",
    "src": "/images/portfolio/editorial/XRAGE_03_6.jpg",
    "alt": "Editorial Photo 49",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "50",
    "src": "/images/portfolio/editorial/XRAGE_03_8.jpg",
    "alt": "Editorial Photo 50",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "51",
    "src": "/images/portfolio/editorial/XRAGE_03_9.jpg",
    "alt": "Editorial Photo 51",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "52",
    "src": "/images/portfolio/editorial/_A1_7900.jpg",
    "alt": "Editorial Photo 52",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
  },
  {
    "id": "53",
    "src": "/images/portfolio/editorial/_A1_8221.jpg",
    "alt": "Editorial Photo 53",
    "category": "Editorial",
    "width": 800,
    "height": 1200,
    "location": "Taipei",
    "date": "2025"
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
