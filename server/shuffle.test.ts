import { describe, it, expect } from 'vitest';

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

describe('Photo Randomization - Fisher-Yates Algorithm', () => {
  it('should return array with same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    
    input.forEach(item => {
      expect(result).toContain(item);
    });
  });

  it('should not modify original array', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffle(input);
    
    expect(input).toEqual(original);
  });

  it('should handle empty array', () => {
    const input: number[] = [];
    const result = shuffle(input);
    expect(result).toEqual([]);
  });

  it('should handle single element array', () => {
    const input = [1];
    const result = shuffle(input);
    expect(result).toEqual([1]);
  });

  it('should produce different orders (statistical test)', () => {
    const input = [1, 2, 3, 4, 5];
    const results: string[] = [];
    
    // Run shuffle 100 times
    for (let i = 0; i < 100; i++) {
      const shuffled = shuffle(input);
      results.push(shuffled.join(','));
    }
    
    // Count unique orderings
    const uniqueOrderings = new Set(results);
    
    // With 5 elements, there are 120 possible permutations
    // After 100 shuffles, we should see at least 30 different orderings
    // (This is a probabilistic test, but failure would be extremely rare)
    expect(uniqueOrderings.size).toBeGreaterThan(30);
  });

  it('should work with photo objects', () => {
    const photos = [
      { id: 1, src: '/photo1.jpg', alt: 'Photo 1' },
      { id: 2, src: '/photo2.jpg', alt: 'Photo 2' },
      { id: 3, src: '/photo3.jpg', alt: 'Photo 3' },
    ];
    
    const shuffled = shuffle(photos);
    
    expect(shuffled).toHaveLength(photos.length);
    photos.forEach(photo => {
      expect(shuffled.find(p => p.id === photo.id)).toBeDefined();
    });
  });

  it('should not create duplicate elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    
    const uniqueElements = new Set(result);
    expect(uniqueElements.size).toBe(result.length);
  });
});
