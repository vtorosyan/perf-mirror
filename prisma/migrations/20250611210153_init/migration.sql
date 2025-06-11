-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "scorePerOccurrence" INTEGER NOT NULL,
    "dimension" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "overrideScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeeklyLog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Default Target',
    "excellentThreshold" INTEGER NOT NULL DEFAULT 225,
    "goodThreshold" INTEGER NOT NULL DEFAULT 170,
    "needsImprovementThreshold" INTEGER NOT NULL DEFAULT 120,
    "timePeriodWeeks" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RoleWeights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "inputWeight" REAL NOT NULL DEFAULT 0.25,
    "outputWeight" REAL NOT NULL DEFAULT 0.35,
    "outcomeWeight" REAL NOT NULL DEFAULT 0.25,
    "impactWeight" REAL NOT NULL DEFAULT 0.15,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyLog_categoryId_week_key" ON "WeeklyLog"("categoryId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "RoleWeights_name_key" ON "RoleWeights"("name");
