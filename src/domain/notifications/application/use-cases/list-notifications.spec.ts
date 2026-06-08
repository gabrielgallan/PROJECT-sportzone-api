import { makeNotification } from "test/unit/factories/make-notification";
import { InMemoryNotificationsRepository } from "test/unit/repositories/in-memory-notifications-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ListNotificationsUseCase } from "./list-notifications";

let notificationsRepository: InMemoryNotificationsRepository;
let sut: ListNotificationsUseCase;

describe("List notifications use case", () => {
    beforeEach(() => {
        notificationsRepository = new InMemoryNotificationsRepository();
        sut = new ListNotificationsUseCase(notificationsRepository);
    });

    it("should be able to list paginated notifications", async () => {
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
            pagination: {
                page: 1,
                limit: 2
            }
        });

        expect(result.isRight()).toBe(true);

        if (result.isRight()) {
            expect(result.value.notifications.data).toHaveLength(2)
            expect(result.value.notifications.meta.page).toBe(1)
            expect(result.value.notifications.meta.limit).toBe(2)
            expect(result.value.notifications.meta.total).toBe(3)
        }
    });
});
