import { makeNotification } from "test/unit/factories/make-notification";
import { InMemoryNotificationsRepository } from "test/unit/repositories/in-memory-notifications-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ReadAllNotificationsUseCase } from "./read-all-notifications";

let notificationsRepository: InMemoryNotificationsRepository;
let sut: ReadAllNotificationsUseCase;

describe("Mark all notifications as read use case", () => {
    beforeEach(() => {
        notificationsRepository = new InMemoryNotificationsRepository();
        sut = new ReadAllNotificationsUseCase(notificationsRepository);
    });

    it("should be able to mark all notifications as read", async () => {
        await notificationsRepository.create(
            makeNotification(
                {
                    recipientId: new UniqueEntityID("user-1"),
                }
            ),
        );

        await notificationsRepository.create(
            makeNotification(
                {
                    recipientId: new UniqueEntityID("user-1"),
                }
            ),
        );

        await notificationsRepository.create(
            makeNotification(
                {
                    recipientId: new UniqueEntityID("user-1"),
                }
            ),
        );

        const result = await sut.execute({
            recipientId: "user-1",
        });

        expect(result.isRight()).toBe(true);

        if (result.isRight()) {
            notificationsRepository.items.forEach(notification => {
                expect(notification.readAt).toEqual(expect.any(Date))
            })
        }
    });
});
