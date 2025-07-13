import prisma from "../config/prisma";


//! Cron Job to delete pending orders (After 7 min) (why 7 Thala for Reason 😎)
export const cleanupPendingOrders = async () => {
    console.log("----------------------------------------");
    console.log("🧹 Running scheduled job: Cleaning up pending orders...");

  
    try {
      // Calculate the timestamp for 10 minutes ago
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
      // Find all orders that meet the deletion criteria
      const abandonedOrders = await prisma.order.findMany({
        where: {
          status: "pending",
          paid: false,
          created_at: {
            lt: tenMinutesAgo, // 'lt' means "less than"
          },
        },
        select: {
          id: true, // We only need the IDs for deletion
        },
      });
  
      if (abandonedOrders.length === 0) {
        console.log("✨ No abandoned orders found to delete.");
        console.log("----------------------------------------");
        return;
      }
  
      const orderIdsToDelete = abandonedOrders.map((order) => order.id);
  
      // Delete all found orders in a single, efficient operation.
      // Because we added `onDelete: Cascade`, Prisma will also delete their OrderItems.
      const deleteResult = await prisma.order.deleteMany({
        where: {
          id: {
            in: orderIdsToDelete,
          },
        },
      });
  
      console.log(`✅ Successfully deleted ${deleteResult.count} abandoned order(s).`);
      console.log("IDs deleted:", orderIdsToDelete);
      console.log("----------------------------------------");
  
    } catch (error) {
      console.error("❌ An error occurred during the cleanup job:", error);
    }
  };