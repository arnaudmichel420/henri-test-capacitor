import { Camera, MediaTypeSelection } from "@capacitor/camera"

export async function pickMedia() {
  try {
    const { results } = await Camera.chooseFromGallery({
      mediaType: MediaTypeSelection.Photo, // photos, videos, or both
      //   allowMultipleSelection: true,
      //   limit: 5,
      includeMetadata: true,
      editable: "in-app",
    })
    const result = results[0]

    return result?.uri
  } catch (e) {
    const error = e as any
    const message = error.code
      ? `[${error.code}] ${error.message}`
      : error.message
    console.error("chooseFromGallery failed:", message)
  }
}
