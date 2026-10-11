import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function seed() {
  console.log("Seeding Wujood Welfare database...");

  // 1. Seed Programs if none exist
  const programCount = await prisma.program.count();
  if (programCount === 0) {
    await prisma.program.createMany({
      data: [
        {
          title: "Food Distribution Drive",
          slug: "food-distribution-drive",
          category: "Food",
          description: "Providing hot meals and monthly dry ration packs to daily-wage families and widows across Faisalabad.",
          targetBeneficiaries: 5000,
          currentBeneficiaries: 3420,
          budget: 1500000,
          status: "active",
          imageUrl: "/gallery-food.jpg",
        },
        {
          title: "Free Healthcare & Medical Camps",
          slug: "free-medical-camps",
          category: "Medical",
          description: "Organizing weekly clinics with qualified doctors, free diagnostic screenings, and essential prescription medicines.",
          targetBeneficiaries: 2500,
          currentBeneficiaries: 1850,
          budget: 950000,
          status: "active",
          imageUrl: "/gallery-medical.jpg",
        },
        {
          title: "Education Support & Literacy",
          slug: "education-support",
          category: "Education",
          description: "Covering school fees, stationery, school uniforms and after-school tuition for underprivileged children.",
          targetBeneficiaries: 1000,
          currentBeneficiaries: 620,
          budget: 800000,
          status: "active",
          imageUrl: "/gallery-education.jpg",
        },
        {
          title: "Winter Clothes & Blanket Drive",
          slug: "winter-clothes-drive",
          category: "Clothes",
          description: "Distributing warm quilts, blankets, sweaters and warm shoes to vulnerable families during winter months.",
          targetBeneficiaries: 1200,
          currentBeneficiaries: 1100,
          budget: 600000,
          status: "active",
          imageUrl: "/gallery-clothes.jpg",
        },
        {
          title: "Health & Hygiene Awareness",
          slug: "hygiene-awareness",
          category: "Awareness",
          description: "Community health workshops on clean water, hygiene practices and maternal child healthcare.",
          targetBeneficiaries: 3000,
          currentBeneficiaries: 2100,
          budget: 350000,
          status: "active",
          imageUrl: "/gallery-community.jpg",
        },
        {
          title: "Emergency Disaster Relief",
          slug: "emergency-disaster-relief",
          category: "Emergency",
          description: "Rapid deployment of cooked food, clean drinking water tanks, dry rations and temporary shelters during natural disasters.",
          targetBeneficiaries: 4000,
          currentBeneficiaries: 4000,
          budget: 2000000,
          status: "active",
          imageUrl: "/gallery-volunteers.jpg",
        },
      ],
    });
    console.log("✓ Seeded Programs");
  }

  // 2. Seed Projects if none exist
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: "Ramadan Iftar & Ration Drive",
          tag: "Food",
          description: "Daily iftar meals served to 250 families and 1,000 ration boxes distributed across Faisalabad.",
          progress: 65,
          targetAmount: 850000,
          raisedAmount: 552500,
          imageUrl: "/gallery-food.jpg",
          status: "ongoing",
          location: "Faisalabad, Punjab",
        },
        {
          title: "Free Medical Camp - Ghaziabad",
          tag: "Medical",
          description: "Free physician consultations, eye exams, diabetes tests, and generic medicines for low-income residents.",
          progress: 80,
          targetAmount: 400000,
          raisedAmount: 320000,
          imageUrl: "/gallery-medical.jpg",
          status: "ongoing",
          location: "Ghaziabad, Faisalabad",
        },
        {
          title: "Back to School Scholarships",
          tag: "Education",
          description: "School fees, textbooks, bags and shoes for 120 deserving students from destitute backgrounds.",
          progress: 45,
          targetAmount: 600000,
          raisedAmount: 270000,
          imageUrl: "/gallery-education.jpg",
          status: "ongoing",
          location: "Taj Colony, Sargodha Road",
        },
        {
          title: "Winter Warmth Blankets",
          tag: "Clothes",
          description: "Warm quilts and thermal coats distributed to homeless elders and children before severe frost.",
          progress: 90,
          targetAmount: 350000,
          raisedAmount: 315000,
          imageUrl: "/gallery-clothes.jpg",
          status: "completed",
          location: "Rural Faisalabad",
        },
        {
          title: "Emergency Flood Relief Camps",
          tag: "Relief",
          description: "Emergency ration packs, chlorine tablets and temporary tent shelter for flood-affected families.",
          progress: 100,
          targetAmount: 1200000,
          raisedAmount: 1200000,
          imageUrl: "/gallery-volunteers.jpg",
          status: "completed",
          location: "South Punjab",
        },
        {
          title: "School Hygiene & Sanitation Awareness",
          tag: "Awareness",
          description: "Handwashing stations and hygiene kits distributed to 15 local government primary schools.",
          progress: 30,
          targetAmount: 250000,
          raisedAmount: 75000,
          imageUrl: "/gallery-community.jpg",
          status: "ongoing",
          location: "MTM Area, Faisalabad",
        },
      ],
    });
    console.log("✓ Seeded Projects");
  }

  // 3. Seed Gallery Items if none exist
  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    await prisma.galleryItem.createMany({
      data: [
        {
          title: "Community Food Distribution at Taj Colony",
          category: "Food Distribution",
          imageUrl: "/gallery-food.jpg",
          description: "Volunteers handing out monthly dry ration bags to registered widow heads of households.",
        },
        {
          title: "Medical Checkup & Diagnostic Camp",
          category: "Medical Camps",
          imageUrl: "/gallery-medical.jpg",
          description: "Volunteer doctors conducting free health screenings and prescribing treatments.",
        },
        {
          title: "Students Receiving School Kits",
          category: "Education Support",
          imageUrl: "/gallery-education.jpg",
          description: "Primary school students smiling after receiving new textbooks, bags, and stationery sets.",
        },
        {
          title: "Youth Volunteers Mobilization",
          category: "Volunteer Activities",
          imageUrl: "/gallery-volunteers.jpg",
          description: "Our dedicated team of university students organizing relief packs at the central center.",
        },
        {
          title: "Winter Warmth Blanket Handover",
          category: "Community Events",
          imageUrl: "/gallery-clothes.jpg",
          description: "Distributing warm quilts to senior citizens ahead of peak winter temperatures.",
        },
        {
          title: "Health & Clean Water Awareness Session",
          category: "Community Events",
          imageUrl: "/gallery-community.jpg",
          description: "Community gathering addressing water filtration and disease prevention.",
        },
      ],
    });
    console.log("✓ Seeded Gallery Items");
  }

  // 4. Seed Contact Messages if none exist
  const messageCount = await prisma.contactMessage.count();
  if (messageCount === 0) {
    await prisma.contactMessage.createMany({
      data: [
        {
          name: "Muhammad Bilal",
          email: "bilal.m@example.com",
          phone: "0300-1234567",
          subject: "Medical assistance inquiry for heart patient",
          message: "Assalam-o-Alaikum, I am inquiring on behalf of my uncle who requires stent surgery assistance. How can we submit his medical reports for review?",
          status: "unread",
        },
        {
          name: "Fatima Noor",
          email: "fatima.noor@csr-pakistan.org",
          phone: "0321-7654321",
          subject: "CSR Partnership & Ration Drive sponsorship",
          message: "Our organization would like to sponsor 200 food ration packs for the upcoming drive in Faisalabad. Please share the banking or sponsorship details.",
          status: "unread",
        },
        {
          name: "Usman Ghani",
          email: "usman.ghani@example.com",
          phone: "0333-9876543",
          subject: "Volunteer team registration from University",
          message: "A group of 15 university students wants to volunteer regularly on weekends for food distribution. Who is the coordinator we can contact?",
          status: "read",
        },
        {
          name: "Sobia Kareem",
          email: "sobia.k@example.com",
          phone: "0345-1122334",
          subject: "Donation receipt acknowledgment",
          message: "Thank you for the quick receipt for my PKR 25,000 contribution. Please keep sending impact photos of the medical camps.",
          status: "replied",
        },
      ],
    });
    console.log("✓ Seeded Contact Messages");
  }

  // 5. Seed Volunteer Opportunities if none exist
  const oppCount = await prisma.volunteerOpportunity.count();
  if (oppCount === 0) {
    await prisma.volunteerOpportunity.createMany({
      data: [
        {
          title: "Ration Pack Sorting & Packaging",
          category: "Food Distribution",
          description: "Help measure, pack, and seal monthly grain, oil, and flour ration packs at our central storage hub.",
          location: "Central Warehouse, Taj Colony, Faisalabad",
          timeCommitment: "3-4 hours (Saturdays 10 AM - 2 PM)",
          spotsNeeded: 8,
          spotsFilled: 5,
          status: "open",
        },
        {
          title: "Free Medical Camp Patient Reception & Registration",
          category: "Healthcare",
          description: "Manage patient queues, register beneficiary vitals, and assist elderly patients reaching physician tables.",
          location: "Community Center, Ghaziabad",
          timeCommitment: "Full Day (Sunday 9 AM - 5 PM)",
          spotsNeeded: 6,
          spotsFilled: 4,
          status: "open",
        },
        {
          title: "Weekend Literacy Teaching Assistant",
          category: "Education",
          description: "Teach basic English, Urdu reading, and mathematics to primary-grade out-of-school children.",
          location: "Welfare Learning Center, Sargodha Road",
          timeCommitment: "2 hours (Saturday & Sunday 3 PM - 5 PM)",
          spotsNeeded: 5,
          spotsFilled: 2,
          status: "open",
        },
        {
          title: "Field Beneficiary Survey & Data Verification",
          category: "Community Outreach",
          description: "Conduct brief doorstep verification interviews with newly registered families in low-income settlements.",
          location: "Various Union Councils, Faisalabad",
          timeCommitment: "Flexible (4 hours/week)",
          spotsNeeded: 10,
          spotsFilled: 3,
          status: "open",
        },
      ],
    });
    console.log("✓ Seeded Volunteer Opportunities");
  }

  // 6. Seed Volunteer Applications if none exist
  const appCount = await prisma.volunteerApplication.count();
  if (appCount === 0) {
    await prisma.volunteerApplication.createMany({
      data: [
        {
          name: "Hamza Farooq",
          fatherName: "Farooq Ahmed",
          email: "hamza.farooq@example.com",
          phone: "0312-3456789",
          city: "Faisalabad",
          qualification: "BS Computer Science (In Progress)",
          gender: "Male",
          skills: "Logistics, Data Entry, Photography",
          availability: "Weekends & Evenings",
          statementOfPurpose: "I want to give back to my city and help organize welfare distribution efficiently.",
          status: "approved",
        },
        {
          name: "Amina Tariq",
          fatherName: "Tariq Mahmood",
          email: "amina.tariq@example.com",
          phone: "0322-8765432",
          city: "Faisalabad",
          qualification: "Pharm-D Graduate",
          gender: "Female",
          skills: "Medicine dispensing, First Aid, Patient Guidance",
          availability: "Sundays",
          statementOfPurpose: "Passionate about serving underserved patients in free medical clinics.",
          status: "pending",
        },
        {
          name: "Zainab Raza",
          fatherName: "Raza Ali",
          email: "zainab.raza@example.com",
          phone: "0301-4455667",
          city: "Faisalabad",
          qualification: "B.Ed Education",
          gender: "Female",
          skills: "Teaching, Child Mentoring, Event Organization",
          availability: "Weekdays 3 PM - 6 PM",
          statementOfPurpose: "Educating kids from marginalized backgrounds is my lifetime calling.",
          status: "approved",
        },
      ],
    });
    console.log("✓ Seeded Volunteer Applications");
  }

  // 7. Seed volunteer users and assignments for the volunteer dashboard
  const seededVolunteers = [
    {
      id: "seed-volunteer-hamza",
      name: "Hamza Farooq",
      email: "hamza@seed.wujoodwelfare.invalid",
    },
    {
      id: "seed-volunteer-amina",
      name: "Amina Tariq",
      email: "amina@seed.wujoodwelfare.invalid",
    },
  ];

  for (const volunteer of seededVolunteers) {
    await prisma.user.upsert({
      where: { id: volunteer.id },
      create: {
        ...volunteer,
        emailVerified: true,
        role: "volunteer",
      },
      update: {
        ...volunteer,
        emailVerified: true,
        role: "volunteer",
      },
    });
  }

  const volunteers = await prisma.user.findMany({
    where: {
      id: { in: seededVolunteers.map((volunteer) => volunteer.id) },
      role: "volunteer",
    },
    select: { id: true },
  });
  const opps = await prisma.volunteerOpportunity.findMany({
    take: 3,
    select: { id: true },
  });

  for (const volunteer of volunteers) {
    const existingAssignments = await prisma.volunteerAssignment.count({
      where: { userId: volunteer.id },
    });

    if (existingAssignments > 0) continue;

    const assignment1 = await prisma.volunteerAssignment.create({
      data: {
        userId: volunteer.id,
        opportunityId: opps[0]?.id,
        title: "Coordinate Weekend Ration Distribution Drive",
        description: "Lead the on-site verification counter and ensure 150 ration packages are safely distributed with token receipts.",
        location: "Taj Colony Distribution Point",
        status: "in_progress",
        priority: "high",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        volunteerNotes: "Confirmed token lists with field manager. Preparing distribution tokens.",
      },
    });

    await prisma.volunteerAssignment.create({
      data: {
        userId: volunteer.id,
        opportunityId: opps[1]?.id,
        title: "Medical Camp Patient Intake & Vitals Desk",
        description: "Assist attending physician by taking initial blood pressure, temperature, and recording basic patient complaint history.",
        location: "Ghaziabad Welfare Center",
        status: "pending",
        priority: "medium",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const assignment3 = await prisma.volunteerAssignment.create({
      data: {
        userId: volunteer.id,
        opportunityId: opps[2]?.id,
        title: "Primary Students Math Tutoring Session",
        description: "Conducted 2-hour remedial arithmetic session for 18 Grade 4 and 5 pupils.",
        location: "Sargodha Road Learning Hub",
        status: "completed",
        priority: "medium",
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        volunteerNotes: "Completed session on multiplication tables and fraction basics. Great student engagement.",
      },
    });

    await prisma.progressLog.createMany({
      data: [
        {
          assignmentId: assignment1.id,
          userId: volunteer.id,
          hoursSpent: 2.5,
          notes: "Inspected warehouse stock, counted 150 bags, verified seal integrity and arranged volunteer badges.",
          statusUpdate: "in_progress",
        },
        {
          assignmentId: assignment3.id,
          userId: volunteer.id,
          hoursSpent: 3.0,
          notes: "Finished classroom instruction and graded practice sheets. Submitted attendance sheet.",
          statusUpdate: "completed",
        },
      ],
    });
  }
  console.log("✓ Seeded Volunteer Assignments and Progress Logs");

  console.log("Database seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
