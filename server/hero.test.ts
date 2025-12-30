import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Hero Slides and Quotes Feature', () => {
  let testSlideId: number;
  let testQuoteId: number;

  beforeAll(async () => {
    // Create a test slide
    const slide = await db.createHeroSlide({
      imageUrl: 'https://example.com/test-slide.jpg',
      title: 'Test Slide',
      isActive: 1,
      sortOrder: 0,
    });
    testSlideId = slide!.id;

    // Create a test quote
    const quote = await db.createHeroQuote({
      textZh: '測試標語中文',
      textEn: 'Test quote in English',
      isActive: 1,
    });
    testQuoteId = quote!.id;
  });

  afterAll(async () => {
    // Clean up
    if (testSlideId) {
      await db.deleteHeroSlide(testSlideId);
    }
    if (testQuoteId) {
      await db.deleteHeroQuote(testQuoteId);
    }
  });

  describe('Hero Slides', () => {
    it('should create a hero slide', async () => {
      const slide = await db.getHeroSlideById(testSlideId);
      expect(slide).toBeDefined();
      expect(slide?.imageUrl).toBe('https://example.com/test-slide.jpg');
      expect(slide?.title).toBe('Test Slide');
      expect(slide?.isActive).toBe(1);
      expect(slide?.sortOrder).toBe(0);
    });

    it('should get all hero slides', async () => {
      const slides = await db.getAllHeroSlides();
      expect(slides.length).toBeGreaterThanOrEqual(1);
      expect(slides.find(s => s.id === testSlideId)).toBeDefined();
    });

    it('should get only active hero slides', async () => {
      const activeSlides = await db.getActiveHeroSlides();
      const testSlide = activeSlides.find(s => s.id === testSlideId);
      expect(testSlide).toBeDefined();
      expect(testSlide?.isActive).toBe(1);
    });

    it('should update a hero slide', async () => {
      await db.updateHeroSlide(testSlideId, {
        title: 'Updated Test Slide',
        isActive: 0,
      });

      const updatedSlide = await db.getHeroSlideById(testSlideId);
      expect(updatedSlide?.title).toBe('Updated Test Slide');
      expect(updatedSlide?.isActive).toBe(0);

      // Restore for other tests
      await db.updateHeroSlide(testSlideId, { isActive: 1 });
    });

    it('should respect sortOrder when getting slides', async () => {
      const slides = await db.getAllHeroSlides();
      // Check if slides are sorted by sortOrder
      for (let i = 1; i < slides.length; i++) {
        expect(slides[i].sortOrder).toBeGreaterThanOrEqual(slides[i - 1].sortOrder);
      }
    });
  });

  describe('Hero Quotes', () => {
    it('should create a hero quote', async () => {
      const quote = await db.getHeroQuoteById(testQuoteId);
      expect(quote).toBeDefined();
      expect(quote?.textZh).toBe('測試標語中文');
      expect(quote?.textEn).toBe('Test quote in English');
      expect(quote?.isActive).toBe(1);
    });

    it('should get all hero quotes', async () => {
      const quotes = await db.getAllHeroQuotes();
      expect(quotes.length).toBeGreaterThanOrEqual(1);
      expect(quotes.find(q => q.id === testQuoteId)).toBeDefined();
    });

    it('should get only active hero quotes', async () => {
      const activeQuotes = await db.getActiveHeroQuotes();
      const testQuote = activeQuotes.find(q => q.id === testQuoteId);
      expect(testQuote).toBeDefined();
      expect(testQuote?.isActive).toBe(1);
    });

    it('should update a hero quote', async () => {
      await db.updateHeroQuote(testQuoteId, {
        textZh: '更新後的標語',
        textEn: 'Updated quote',
        isActive: 0,
      });

      const updatedQuote = await db.getHeroQuoteById(testQuoteId);
      expect(updatedQuote?.textZh).toBe('更新後的標語');
      expect(updatedQuote?.textEn).toBe('Updated quote');
      expect(updatedQuote?.isActive).toBe(0);

      // Restore for other tests
      await db.updateHeroQuote(testQuoteId, { isActive: 1 });
    });

    it('should have default quotes in database', async () => {
      const quotes = await db.getAllHeroQuotes();
      // Should have at least the 3 default quotes we inserted
      expect(quotes.length).toBeGreaterThanOrEqual(3);
      
      // Check if default quotes exist
      const defaultQuote = quotes.find(q => 
        q.textZh.includes('活著本身就是一場浩劫')
      );
      expect(defaultQuote).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should filter inactive slides from active list', async () => {
      // Create an inactive slide
      const inactiveSlide = await db.createHeroSlide({
        imageUrl: 'https://example.com/inactive-slide.jpg',
        title: 'Inactive Slide',
        isActive: 0,
        sortOrder: 999,
      });

      const activeSlides = await db.getActiveHeroSlides();
      const foundInactive = activeSlides.find(s => s.id === inactiveSlide!.id);
      expect(foundInactive).toBeUndefined();

      // Clean up
      await db.deleteHeroSlide(inactiveSlide!.id);
    });

    it('should filter inactive quotes from active list', async () => {
      // Create an inactive quote
      const inactiveQuote = await db.createHeroQuote({
        textZh: '不活躍的標語',
        textEn: 'Inactive quote',
        isActive: 0,
      });

      const activeQuotes = await db.getActiveHeroQuotes();
      const foundInactive = activeQuotes.find(q => q.id === inactiveQuote!.id);
      expect(foundInactive).toBeUndefined();

      // Clean up
      await db.deleteHeroQuote(inactiveQuote!.id);
    });
  });
});
