import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 使用 Fisher-Yates 演算法隨機打亂陣列
 * @param array 要打亂的陣列
 * @returns 打亂後的新陣列（不修改原陣列）
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // 建立副本，不修改原陣列
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
