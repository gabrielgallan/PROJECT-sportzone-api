import type { Cordinate } from "./cordinate";

export interface Geocoder {
	searchFromAddress(address: string): Promise<Cordinate | null>;
	searchFromCordinate(cordinate: Cordinate): Promise<string | null>;
}
