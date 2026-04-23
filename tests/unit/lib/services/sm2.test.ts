import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SM2Service } from '@/lib/services/sm2';

describe('SM2Service', () => {
  let service: SM2Service;

  beforeEach(() => {
    service = new SM2Service();
  });

  describe('calculate — 不正解 (rating < 3)', () => {
    it('rating=1 のとき repetitions=0・interval=1 にリセットし EF を 0.20 減少する', () => {
      // Given
      const params = { easeFactor: 2.5, interval: 10, repetitions: 3 };

      // When
      const result = service.calculate(params, 1);

      // Then
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.3, 10); // 2.5 - 0.20
    });

    it('rating=2 のとき repetitions=0・interval=1 にリセットし EF を 0.10 減少する', () => {
      // Given
      const params = { easeFactor: 2.5, interval: 10, repetitions: 5 };

      // When
      const result = service.calculate(params, 2);

      // Then
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.4, 10); // 2.5 - 0.10
    });
  });

  describe('calculate — 正解 (rating >= 3)', () => {
    it('rating=3, repetitions=0 のとき rep=1・interval=1・EF 変化なし', () => {
      // Given
      const params = { easeFactor: 2.5, interval: 1, repetitions: 0 };

      // When
      const result = service.calculate(params, 3);

      // Then
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.5, 10); // 2.5 + 0.00
    });

    it('rating=3, repetitions=1 のとき rep=2・interval=6・EF 変化なし', () => {
      // Given
      const params = { easeFactor: 2.5, interval: 1, repetitions: 1 };

      // When
      const result = service.calculate(params, 3);

      // Then
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
      expect(result.easeFactor).toBeCloseTo(2.5, 10);
    });

    it('rating=3, repetitions=2 のとき interval=round(prev * newEF)', () => {
      // Given
      const params = { easeFactor: 2.5, interval: 6, repetitions: 2 };

      // When
      const result = service.calculate(params, 3);

      // Then
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(Math.round(6 * 2.5)); // 15
      expect(result.easeFactor).toBeCloseTo(2.5, 10);
    });

    it('rating=4, repetitions=0 のとき rep=1・interval=1・EF += 0.10', () => {
      // Given
      const params = { easeFactor: 2.4, interval: 1, repetitions: 0 };

      // When
      const result = service.calculate(params, 4);

      // Then
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.5, 10); // 2.4 + 0.10
    });

    it('rating=4, repetitions=1 のとき rep=2・interval=6・EF += 0.10', () => {
      // Given
      const params = { easeFactor: 2.3, interval: 1, repetitions: 1 };

      // When
      const result = service.calculate(params, 4);

      // Then
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
      expect(result.easeFactor).toBeCloseTo(2.4, 10); // 2.3 + 0.10
    });
  });

  describe('calculate — EF クランプ', () => {
    it('rating=4, EF=2.5 のとき EF は 2.5 を超えない', () => {
      // Given
      const params = { easeFactor: 2.5, interval: 10, repetitions: 5 };

      // When
      const result = service.calculate(params, 4);

      // Then
      expect(result.easeFactor).toBe(2.5); // min(2.5, 2.5 + 0.10)
    });

    it('rating=1, EF=1.3 のとき EF は 1.3 以下にならない', () => {
      // Given — EF がすでに最小値
      const params = { easeFactor: 1.3, interval: 1, repetitions: 0 };

      // When
      const result = service.calculate(params, 1);

      // Then
      expect(result.easeFactor).toBe(1.3); // max(1.3, 1.3 - 0.20)
    });

    it('rating=1 で EF が 1.3 + 0.20 = 1.5 のとき EF = 1.3 にクランプされる', () => {
      // Given
      const params = { easeFactor: 1.4, interval: 1, repetitions: 0 };

      // When
      const result = service.calculate(params, 1);

      // Then
      expect(result.easeFactor).toBe(1.3); // max(1.3, 1.4 - 0.20 = 1.2) → 1.3
    });
  });

  describe('calculate — nextReviewDate', () => {
    it('interval=1 のとき nextReviewDate が明日の 0:00:00 になる', () => {
      // Given
      const params = { easeFactor: 2.5, interval: 1, repetitions: 0 };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() + 1);

      // When
      const result = service.calculate(params, 3); // rating=3, rep=0 → interval=1

      // Then
      expect(result.nextReviewDate.getFullYear()).toBe(expectedDate.getFullYear());
      expect(result.nextReviewDate.getMonth()).toBe(expectedDate.getMonth());
      expect(result.nextReviewDate.getDate()).toBe(expectedDate.getDate());
      expect(result.nextReviewDate.getHours()).toBe(0);
      expect(result.nextReviewDate.getMinutes()).toBe(0);
      expect(result.nextReviewDate.getSeconds()).toBe(0);
    });

    it('interval=6 のとき nextReviewDate が 6日後の 0:00:00 になる', () => {
      // Given
      const params = { easeFactor: 2.5, interval: 1, repetitions: 1 };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() + 6);

      // When
      const result = service.calculate(params, 3); // rep=1 → interval=6

      // Then
      expect(result.nextReviewDate.getFullYear()).toBe(expectedDate.getFullYear());
      expect(result.nextReviewDate.getMonth()).toBe(expectedDate.getMonth());
      expect(result.nextReviewDate.getDate()).toBe(expectedDate.getDate());
    });
  });
});
