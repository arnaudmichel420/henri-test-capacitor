import { ActionSheet } from "@capacitor/action-sheet"
import { takePicture } from "./camera"
import { pickMedia } from "./gallery"

export async function photoActions() {
  const { index } = await ActionSheet.showActions({
    title: "Photo",
    options: [
      { title: "Prendre une photo" },
      { title: "Choisir dans la galerie" },
    ],
    cancelable: true,
  })

  if (index === 0) return takePicture()
  if (index === 1) return pickMedia()
}
