import { ResendEmailSender } from './resend/resend-email-sender';

const services = {
	emailSender: new ResendEmailSender(),
};

export { services };
