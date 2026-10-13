import "dotenv/config";
import { prisma } from "@/lib/prisma";
import {
  projectSchema,
  PROJECT_STATUSES,
} from "@/validation/project";
import {
  getPublishedProjects,
  getPublishedProjectBySlug,
} from "@/actions/projects";

async function runTests() {
  console.log("==========================================");
  console.log("MODULE 04: PROJECTS MANAGEMENT VERIFICATION");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  // --- TEST SUITE 1: STATUS ENUMS ---
  console.log("\n--- TEST SUITE 1: Project Statuses ---");
  const expectedStatuses = ["planned", "active", "completed", "archived"];
  assert(
    JSON.stringify(PROJECT_STATUSES) === JSON.stringify(expectedStatuses),
    "Supported statuses match requirement: Planned, Active, Completed, Archived"
  );

  // --- TEST SUITE 2: VALIDATION REJECTION ---
  console.log("\n--- TEST SUITE 2: Validation Rules & Rejection ---");

  // Invalid title (< 2 chars)
  const titleTooShort = projectSchema.safeParse({
    title: "A",
    description: "Valid description for welfare initiative testing purposes.",
  });
  assert(!titleTooShort.success, "Rejects title shorter than 2 chars");

  // Invalid description (< 10 chars)
  const descTooShort = projectSchema.safeParse({
    title: "Valid Project Title",
    description: "Too short",
  });
  assert(!descTooShort.success, "Rejects description shorter than 10 chars");

  // Invalid status
  const invalidStatus = projectSchema.safeParse({
    title: "Valid Project Title",
    description: "Valid description for welfare initiative testing purposes.",
    status: "in_progress", // Not allowed
  });
  assert(!invalidStatus.success, "Rejects invalid status (e.g. 'in_progress')");

  // Invalid slug (spaces and special characters)
  const invalidSlug = projectSchema.safeParse({
    title: "Valid Project Title",
    slug: "Invalid Slug With Spaces!",
    description: "Valid description for welfare initiative testing purposes.",
  });
  assert(!invalidSlug.success, "Rejects invalid slug formatting");

  // Invalid image URL
  const invalidImage = projectSchema.safeParse({
    title: "Valid Project Title",
    description: "Valid description for welfare initiative testing purposes.",
    images: ["not-a-valid-url"],
  });
  assert(!invalidImage.success, "Rejects invalid image URL");

  // Valid project input
  const validData = projectSchema.safeParse({
    title: "Clean Drinking Water Filtration Plant",
    slug: "clean-drinking-water-plant",
    description: "Installation of community water filtration plant providing 10,000 liters daily.",
    images: ["https://example.com/water-plant.jpg"],
    status: "planned",
    published: false,
    startDate: "2026-05-01",
    endDate: "2026-08-31",
    location: "Chak 204 RB, Faisalabad",
  });
  assert(validData.success, "Accepts completely valid project payload");

  // --- TEST SUITE 3: DATABASE CRUD & PROGRAM LINKING ---
  console.log("\n--- TEST SUITE 3: Database CRUD & Program Linking ---");

  // Check or find existing program
  const existingProgram = await prisma.program.findFirst();
  assert(!!existingProgram, "Program exists in database to link project to");

  const testSlug = `test-initiative-${Date.now()}`;
  const testTitle = `Test Water Initiative ${Date.now()}`;

  // 1. Create (Unpublished)
  const createdProject = await prisma.project.create({
    data: {
      title: testTitle,
      slug: testSlug,
      description: "A test project specifically created to verify Module 04 end-to-end functionality.",
      images: JSON.stringify(["/gallery-community.jpg"]),
      status: "planned",
      published: false,
      publishedAt: null,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-09-01"),
      location: "Faisalabad Industrial Area",
      programId: existingProgram ? existingProgram.id : null,
    },
    include: {
      program: true,
    },
  });

  assert(!!createdProject.id, "Successfully created project in database");
  assert(createdProject.published === false, "Project is created as unpublished (published: false)");
  assert(
    !existingProgram || createdProject.program?.id === existingProgram.id,
    "Project successfully linked to Program"
  );

  // --- TEST SUITE 4: UNPUBLISHED PROJECTS VISIBILITY ---
  console.log("\n--- TEST SUITE 4: Unpublished Visibility Isolation ---");

  const publishedList = await getPublishedProjects();
  const foundInPublishedList = publishedList.some((p) => p.id === createdProject.id || p.slug === testSlug);
  assert(!foundInPublishedList, "Unpublished project is HIDDEN from getPublishedProjects()");

  const singleFetch = await getPublishedProjectBySlug(testSlug);
  assert(singleFetch === null, "Unpublished project returns NULL from getPublishedProjectBySlug()");

  // --- TEST SUITE 5: STATUS TRANSITIONS & PUBLISHING ---
  console.log("\n--- TEST SUITE 5: Status Transitions & Publishing ---");

  // Update through statuses
  for (const st of ["active", "completed", "archived"] as const) {
    const updated = await prisma.project.update({
      where: { id: createdProject.id },
      data: { status: st },
    });
    assert(updated.status === st, `Project status transition to '${st}' works`);
  }

  // Publish project
  const publishedProject = await prisma.project.update({
    where: { id: createdProject.id },
    data: {
      published: true,
      publishedAt: new Date(),
      status: "active",
    },
  });
  assert(publishedProject.published === true, "Project published flag toggled to true");

  const publishedListAfter = await getPublishedProjects();
  const foundAfterPublish = publishedListAfter.some((p) => p.id === createdProject.id);
  assert(foundAfterPublish, "Published project now APPEARS in getPublishedProjects()");

  const singleFetchAfter = await getPublishedProjectBySlug(testSlug);
  assert(
    singleFetchAfter !== null && singleFetchAfter.id === createdProject.id,
    "Published project can be fetched by slug via getPublishedProjectBySlug()"
  );

  // --- TEST SUITE 6: PROJECT DELETION ---
  console.log("\n--- TEST SUITE 6: Project Deletion ---");

  await prisma.project.delete({
    where: { id: createdProject.id },
  });

  const checkDeleted = await prisma.project.findUnique({
    where: { id: createdProject.id },
  });
  assert(checkDeleted === null, "Deleted project is removed from database");

  const checkDeletedSlug = await getPublishedProjectBySlug(testSlug);
  assert(checkDeletedSlug === null, "Deleted project cannot be fetched via slug");

  // Summary
  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
