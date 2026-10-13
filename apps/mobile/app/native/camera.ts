import { Camera } from "@capacitor/camera"

export const takePicture = async () => {
  try {
    // On native: pass result.uri to the Filesystem API to get the full-resolution base64,
    // or use result.thumbnail for a lower-resolution base64 preview.
    // On Web: result.thumbnail contains the full image base64 encoded.
    const result = await Camera.takePhoto({
      quality: 90,
      includeMetadata: true,
      editable: "in-app",
      correctOrientation: true,
    })

    return result?.uri
  } catch (e) {
    const error = e as any
    // error.code contains the structured error code (e.g. 'OS-PLUG-CAMR-0003')
    // when thrown by the native layer. See the Errors section for all codes.
    const message = error.code
      ? `[${error.code}] ${error.message}`
      : error.message
    console.error("takePhoto failed:", message)
  }
}
