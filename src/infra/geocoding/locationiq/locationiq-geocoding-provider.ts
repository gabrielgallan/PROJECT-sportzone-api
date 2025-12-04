import type { GeocodingProvider, GetCordinatesFromAddressProviderRequest,  } from "@/domain/contracts/geocoding-provider.ts";
import env from "@/infra/env/config.ts";
import axios from "axios";
import { AddressNotFound } from "./errors/address-not-found.ts";
import { LocationIqServerError } from "./errors/locationiq-server-error.ts";
import { InternalServerError } from "./errors/internal-server-error.ts";

const locationIq = axios.create({
    baseURL: 'https://api.locationiq.com/v1',
    params: {
        key: env.LOCATIONIQ_API_KEY,
        format: 'json'
    },
    timeout: 8000
})


export class LocationIqGeocodingProvider implements GeocodingProvider {
    async getCordinatesFromAddress({ address }: GetCordinatesFromAddressProviderRequest) {
        try {
            const response = await locationIq.get('/search', {
                params: {
                    q: address,
                    countrycodes: 'br',
                    limit: 1
                }
            })

            if (!response.data || response.data.length === 0) {
                throw new AddressNotFound()
            }

            const { lat, lon, display_name } = response.data[0]

            return {
                latitude: Number(lat),
                longitude: Number(lon),
                display_name
            }
        } catch (err: any) {
            if (err instanceof AddressNotFound) { throw err }

            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    throw new InternalServerError()
                }

                if (err.response?.status === 404) {
                    throw new AddressNotFound()
                }

                if (err.code === "ECONNABORTED") {
                    throw new LocationIqServerError(err.message)
                }
            }

            throw new LocationIqServerError(err.message)
        }
    }
}