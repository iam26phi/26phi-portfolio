import { describe, it, expect } from 'vitest';
import { extractExifData } from './exif';

describe('EXIF Extraction', () => {
  it('should handle files without EXIF data gracefully', async () => {
    // Create a simple test image without EXIF
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });
    
    const file = new File([blob], 'test.png', { type: 'image/png' });
    const result = await extractExifData(file);
    
    // Should return empty object for images without EXIF
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('should return ExifData object structure', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg');
    });
    
    const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
    const result = await extractExifData(file);
    
    // Check that result has the expected structure
    expect(result).toHaveProperty('camera');
    expect(result).toHaveProperty('lens');
    expect(result).toHaveProperty('settings');
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('location');
  });

  it('should handle invalid files gracefully', async () => {
    const file = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
    const result = await extractExifData(file);
    
    // Should return empty object for invalid files
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});
