import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CmsFooter data...');

  const footerCount = await prisma.cmsFooter.count();

  if (footerCount > 0) {
    console.log('Clearing existing footer data...');
    await prisma.cmsFooter.deleteMany();
  }

  const newFooter = await prisma.cmsFooter.create({
    data: {
      companyLogo: "/Untitled-1.png",
      description: "Made with ❤️ for Dog Community",
      socialLinks: [
        { name: "Facebook", url: "#" },
        { name: "Instagram", url: "#" },
        { name: "YouTube", url: "#" },
        { name: "LinkedIn", url: "#" },
        { name: "WhatsApp", url: "#" }
      ],
      quickLinks: [
        { label: "Home", url: "/" },
        { label: "About Us", url: "/about" },
        { label: "Events", url: "/events" },
        { label: "Judges", url: "/judges" },
        { label: "Dog Registration", url: "/dogs/register" },
        { label: "Gallery", url: "/gallery" },
        { label: "Video Gallery", url: "/gallery/videos" },
        { label: "Contact Us", url: "/contact" }
      ],
      services: [
        { label: "Dog Registration", url: "#" },
        { label: "Event Management", url: "#" },
        { label: "Photography", url: "#" },
        { label: "Videography", url: "#" },
        { label: "Competition Mgmt", url: "#" },
        { label: "Winner Certification", url: "#" },
        { label: "Marketplace", url: "#" },
        { label: "Breeding Services", url: "#" }
      ],
      resources: [
        { label: "Rule Book", url: "#" },
        { label: "User Manual", url: "#" },
        { label: "FAQ", url: "#" },
        { label: "Privacy Policy", url: "/privacy" },
        { label: "Terms & Conditions", url: "/terms" },
        { label: "Refund Policy", url: "/refund" }
      ],
      contactDetails: {
        phone: "+91 98765 43210",
        email: "support@juzdog.com",
        address: "Mumbai, India"
      },
      copyrightText: "@ 2026 JuzDog",
      privacyUrl: "/privacy",
      termsUrl: "/terms"
    }
  });

  console.log('Seeded successfully:', newFooter.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
