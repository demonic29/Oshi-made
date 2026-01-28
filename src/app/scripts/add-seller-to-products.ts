// // scripts/add-seller-to-products.ts
// import { prisma } from "@/lib/prisma";

// async function main() {
//     // Find a seller user or create one
//     const seller = await prisma.user.findFirst({
//         where: { role: "SELLER" },
//     });

//     if (!seller) {
//         console.error("No seller found! Create a seller user first.");
//         return;
//     }

//     // Update all products without sellerId
//     await prisma.product.updateMany({
//         where: { sellerId: null },
//         data: { sellerId: seller.id },
//     });

//     console.log("Updated products with sellerId");
// }

// main();
