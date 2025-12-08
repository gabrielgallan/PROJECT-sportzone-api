import dayjs from "dayjs";

export function CalculateBookingPrice(
    startTime: Date,
    endTime: Date,
    CourtPricePerHour: number
) {
    const startTimeJs = dayjs(startTime)
    const endTimeJs = dayjs(endTime)

    const differenceBetweenTimesInHours = endTimeJs.diff(startTimeJs, 'hour')

    return differenceBetweenTimesInHours * CourtPricePerHour
}