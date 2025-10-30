/**
 * Quantum Harmonic Oscillator Wavefunction Calculations
 *
 * Implements 2D quantum harmonic oscillator eigenstates:
 * ψₙₓ,ₙᵧ(x,y) = ψₙₓ(x) · ψₙᵧ(y)
 *
 * where ψₙ(x) = e^(−x²/2) · Hₙ(x) / √(2ⁿ · n! · √π)
 *
 * Hₙ(x) are the physicists' Hermite polynomials
 */

/**
 * Compute n! with memoization for performance
 */
const factorialCache = new Map<number, number>([[0, 1], [1, 1]]);

function factorial(n: number): number {
  if (n < 0) {
    throw new Error("Factorial not defined for negative numbers");
  }

  const cached = factorialCache.get(n);
  if (cached !== undefined) {
    return cached;
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    if (!factorialCache.has(i)) {
      result = i * (factorialCache.get(i - 1) ?? 1);
      factorialCache.set(i, result);
    }
  }

  return factorialCache.get(n) ?? 1;
}

/**
 * Compute physicists' Hermite polynomial Hₙ(x) using recurrence relation:
 * H₀(x) = 1
 * H₁(x) = 2x
 * Hₙ₊₁(x) = 2x·Hₙ(x) - 2n·Hₙ₋₁(x)
 */
function hermitePolynomial(n: number, x: number): number {
  if (n === 0) return 1;
  if (n === 1) return 2 * x;

  let hPrev = 1;  // H₀
  let hCurr = 2 * x;  // H₁

  for (let k = 1; k < n; k++) {
    const hNext = 2 * x * hCurr - 2 * k * hPrev;
    hPrev = hCurr;
    hCurr = hNext;
  }

  return hCurr;
}

/**
 * Compute 1D quantum harmonic oscillator eigenstate:
 * ψₙ(x) = e^(−x²/2) · Hₙ(x) / √(2ⁿ · n! · √π)
 */
export function wavefunction1D(n: number, x: number): number {
  const hermite = hermitePolynomial(n, x);
  const normalization = Math.sqrt(Math.pow(2, n) * factorial(n) * Math.sqrt(Math.PI));
  const gaussian = Math.exp(-x * x / 2);

  return (gaussian * hermite) / normalization;
}

/**
 * Compute 2D quantum harmonic oscillator eigenstate:
 * ψₙₓ,ₙᵧ(x,y) = ψₙₓ(x) · ψₙᵧ(y)
 */
export function wavefunction2D(nx: number, ny: number, x: number, y: number): number {
  return wavefunction1D(nx, x) * wavefunction1D(ny, y);
}

/**
 * Generate a 2D grid of wavefunction values for visualization
 */
export interface QuantumGrid {
  values: number[][];
  min: number;
  max: number;
  width: number;
  height: number;
}

export function generateQuantumGrid(
  nx: number,
  ny: number,
  gridSize: number,
  spatialRange: number = 5
): QuantumGrid {
  const values: number[][] = [];
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < gridSize; i++) {
    const row: number[] = [];
    const y = ((i / (gridSize - 1)) * 2 - 1) * spatialRange;

    for (let j = 0; j < gridSize; j++) {
      const x = ((j / (gridSize - 1)) * 2 - 1) * spatialRange;
      const psi = wavefunction2D(nx, ny, x, y);

      row.push(psi);
      min = Math.min(min, psi);
      max = Math.max(max, psi);
    }

    values.push(row);
  }

  return { values, min, max, width: gridSize, height: gridSize };
}
