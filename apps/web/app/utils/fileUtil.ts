import { Filesystem } from "@capacitor/filesystem"

export async function deleteFile(path?: string | null) {
  if (!path) return

  try {
    await Filesystem.deleteFile({
      path: path,
    })
  } catch (error) {}
}