CREATE TABLE "sports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "court_sports" (
    "court_id" TEXT NOT NULL,
    "sport_id" TEXT NOT NULL,

    CONSTRAINT "court_sports_pkey" PRIMARY KEY ("court_id", "sport_id")
);

CREATE UNIQUE INDEX "sports_slug_key" ON "sports"("slug");

ALTER TABLE "court_sports" ADD CONSTRAINT "court_sports_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "court_sports" ADD CONSTRAINT "court_sports_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "sports" ("id", "name", "slug")
VALUES
    ('soccer', 'Soccer', 'soccer'),
    ('football', 'Football', 'football'),
    ('volley', 'Volley', 'volley')
ON CONFLICT ("id") DO UPDATE SET
    "name" = EXCLUDED."name",
    "slug" = EXCLUDED."slug";
