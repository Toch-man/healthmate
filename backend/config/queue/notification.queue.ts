import { Queue, Worker } from "bullmq";
import redis from "../redis.ts";
import prisma from "../../src/db.ts";

// create queue
export const notification_queue = new Queue("notifications", {
  connection: { host: "localhost", port: 6379 },
});

// worker that processes jobs
const notification_worker = new Worker(
  "notifications",
  async (job) => {
    const { user_id, title, message } = job.data;

    await prisma.notification.create({
      data: { user_id, title, message },
    });

    console.log(`Notification sent to ${user_id}`);
  },
  {
    connection: { host: "localhost", port: 6379 },
  },
);

notification_worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

notification_worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
