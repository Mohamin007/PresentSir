import * as faceapi from "face-api.js"

let modelLoadPromise: Promise<void> | null = null

export function loadFaceRecognitionModels() {
  if (!modelLoadPromise) {
    modelLoadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]).then(() => undefined)
  }

  return modelLoadPromise
}

export function parseFaceEmbedding(value: unknown): number[] | null {
  if (!value) return null

  if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
    return value
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === "number")) {
        return parsed
      }
    } catch {
      return null
    }
  }

  return null
}

export function embeddingToDescriptor(embedding: number[]) {
  return new Float32Array(embedding)
}

export function descriptorToEmbedding(descriptor: Float32Array) {
  return Array.from(descriptor)
}

export { faceapi }
