/**
 * Calculates Euclidean Distance between two 128-float face embedding vectors
 */
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
    throw new Error("Invalid vector dimensions for comparison.");
  }
  return Math.sqrt(
    vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0)
  );
}

/**
 * Helper to generate mock 128-float embedding vector for testing/demonstration
 */
export function generateMockEmbedding() {
  return Array.from({ length: 128 }, () => Number((Math.random() * 2 - 1).toFixed(4)));
}

/**
 * Gets or sets browser fingerprint stored locally
 */
export function getDeviceFingerprint() {
  let fp = localStorage.getItem("pamsu_device_fp");
  if (!fp) {
    fp = "DEV-" + crypto.randomUUID();
    localStorage.setItem("pamsu_device_fp", fp);
  }
  return fp;
}