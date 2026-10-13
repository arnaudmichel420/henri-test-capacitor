import { GoogleMap } from "@capacitor/google-maps"
import type { DetailedHTMLProps, HTMLAttributes } from "react"
import { useEffect, useRef } from "react"

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "capacitor-google-map": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

export default function Map({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) {
  const mapRef = useRef<HTMLElement>(null)

  async function createMap() {
    if (!mapRef.current) return

    const map = await GoogleMap.create({
      id: "task",
      element: mapRef.current,
      apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY ?? "",
      config: {
        center: {
          lat: latitude,
          lng: longitude,
        },
        zoom: 12,
      },
    })
    await map.addMarker({
      coordinate: { lat: latitude, lng: longitude },
      iconUrl: "/static/alien.svg",
    })
  }

  useEffect(() => {
    createMap()
  }, [])

  return (
    <capacitor-google-map
      ref={mapRef}
      style={{
        width: "100%",
        height: "300px",
      }}
    ></capacitor-google-map>
  )
}
