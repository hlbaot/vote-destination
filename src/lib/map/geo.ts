import { geoMercator, type GeoProjection } from "d3-geo"
import type { FeatureCollection, MultiPoint } from "geojson"

export const VIEWBOX = { width: 650, height: 900, pad: 28 } as const

const fitPoints: [number, number][] = [
  [102.14, 22.4],
  [105.32, 23.36],
  [109.46, 12.65],
  [104.84, 8.57],
  [112, 16.5],
  [114.5, 9.5],
  [117, 6.5],
]

const fitCollection: FeatureCollection<MultiPoint> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "MultiPoint",
        coordinates: fitPoints,
      },
    },
  ],
}

export const mapProjection: GeoProjection = geoMercator().fitExtent(
  [
    [VIEWBOX.pad, VIEWBOX.pad],
    [VIEWBOX.width - VIEWBOX.pad, VIEWBOX.height - VIEWBOX.pad],
  ],
  fitCollection,
)

export function project(lng: number, lat: number): [number, number] {
  const projected = mapProjection([lng, lat])
  return projected ? [projected[0], projected[1]] : [0, 0]
}

export const islandGroups = [
  {
    id: "hoang-sa",
    label: "QĐ. Hoàng Sa",
    sublabel: "TP. Đà Nẵng",
    points: [
      [111.65, 16.75], [111.82, 16.42], [112.05, 16.62], [112.28, 16.35],
      [112.45, 16.78], [111.95, 16.95], [112.18, 16.12], [111.72, 16.18],
    ] as [number, number][],
    labelAt: [112.55, 16.96] as [number, number],
  },
  {
    id: "truong-sa",
    label: "QĐ. Trường Sa",
    sublabel: "Khánh Hòa",
    points: [
      [111.7, 11.1], [112.4, 10.5], [113.1, 9.9], [113.8, 10.8],
      [114.5, 9.5], [115.2, 8.8], [116.1, 8.2], [116.8, 7.2],
      [114.9, 11.6], [113.5, 7.6], [112.5, 8.8], [115.9, 10.5],
    ] as [number, number][],
    labelAt: [115.15, 11.2] as [number, number],
  },
]
