import { describe, it, expect } from 'vitest';
import { CostCalculator } from '../src/core/cost-calculator';

const PRICING = { inputPerMillionTokens: 3, outputPerMillionTokens: 15 };

describe('cost-calculator', () => {
  const calc = new CostCalculator();

  it('1M input tokens custa o preço de entrada', () => {
    const cost = calc.calculate(1_000_000, 0, PRICING);
    expect(cost.inputCost).toBeCloseTo(3);
    expect(cost.outputCost).toBeCloseTo(0);
    expect(cost.totalCost).toBeCloseTo(3);
  });

  it('1M output tokens custa o preço de saída', () => {
    const cost = calc.calculate(0, 1_000_000, PRICING);
    expect(cost.outputCost).toBeCloseTo(15);
    expect(cost.totalCost).toBeCloseTo(15);
  });

  it('100K input', () => {
    const cost = calc.calculate(100_000, 0, PRICING);
    expect(cost.inputCost).toBeCloseTo(0.3);
  });

  it('500K output', () => {
    const cost = calc.calculate(0, 500_000, PRICING);
    expect(cost.outputCost).toBeCloseTo(7.5);
  });

  it('zero tokens custa zero', () => {
    const cost = calc.calculate(0, 0, PRICING);
    expect(cost.totalCost).toBe(0);
  });

  it('calcula cache separadamente (read e write)', () => {
    const pricing = {
      inputPerMillionTokens: 3,
      outputPerMillionTokens: 15,
      cacheReadPerMillionTokens: 0.3,
      cacheWritePerMillionTokens: 3.75,
    };
    const cost = calc.calculate(0, 0, pricing, 1_000_000, 1_000_000);
    expect(cost.cacheReadCost).toBeCloseTo(0.3);
    expect(cost.cacheWriteCost).toBeCloseTo(3.75);
    expect(cost.totalCost).toBeCloseTo(4.05);
  });

  it('não mistura cache com entrada/saída', () => {
    const pricing = {
      inputPerMillionTokens: 3,
      outputPerMillionTokens: 15,
      cacheReadPerMillionTokens: 0.3,
      cacheWritePerMillionTokens: 3.75,
    };
    const cost = calc.calculate(1_000_000, 1_000_000, pricing, 1_000_000, 0);
    expect(cost.inputCost).toBeCloseTo(3);
    expect(cost.outputCost).toBeCloseTo(15);
    expect(cost.cacheReadCost).toBeCloseTo(0.3);
    expect(cost.totalCost).toBeCloseTo(18.3);
  });
});
