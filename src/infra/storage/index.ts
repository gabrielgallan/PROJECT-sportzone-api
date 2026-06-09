import { CloudinaryStorage } from "./cloudinary/cloudinary-storage";

const services = {
    uploader: new CloudinaryStorage()
}

export { services }