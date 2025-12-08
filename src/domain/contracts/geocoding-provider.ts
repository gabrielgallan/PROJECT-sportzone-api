export interface GetCordinatesFromAddressProviderRequest {
    address: string
}

export interface GetCordinatesFromAddressProviderResponse {
    latitude: number,
    longitude: number,
    display_name: string
}

export interface GeocodingProvider {
    getCordinatesFromAddress({ address }: GetCordinatesFromAddressProviderRequest): Promise<GetCordinatesFromAddressProviderResponse>
}