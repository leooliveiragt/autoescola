export interface CepData {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
  lat: number | null
  lng: number | null
}

export async function buscarCEP(cep: string): Promise<CepData | null> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`, {
      next: { revalidate: 86400 }, // cache 24h
    })
    if (!res.ok) return null
    const data = await res.json()

    const lat = data.location?.coordinates?.latitude
      ? parseFloat(data.location.coordinates.latitude)
      : null
    const lng = data.location?.coordinates?.longitude
      ? parseFloat(data.location.coordinates.longitude)
      : null

    return {
      cep: clean,
      state: data.state ?? '',
      city: data.city ?? '',
      neighborhood: data.neighborhood ?? '',
      street: data.street ?? '',
      lat,
      lng,
    }
  } catch {
    return null
  }
}

// Haversine formula — returns distance in km between two coordinates
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
