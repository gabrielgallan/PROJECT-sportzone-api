import { Cordinate } from "@/utils/get-distance-between-cordinates";

export interface Geocoder {
    searchFromAddress(address: string): Promise<Cordinate | null>
    searchFromCordinate(cordinate: Cordinate): Promise<string | null>
}