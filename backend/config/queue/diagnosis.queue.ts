import { Queue, Worker } from "bullmq";
import prisma from "../../src/db.ts";

export const diagnosis_queue = new Queue("diagnosis", {
  connection: { host: "localhost", port: 6379 },
});

const diagnosis_worker = new Worker(
  "diagnosis",
  async (job) => {
    const { patient_id, symptoms, raw_input } = job.data;

    // run your TensorFlow model here
    // const result = await run_tf_model(symptoms);

    await prisma.healthRecord.create({
      data: {
        patient_id,
        rawInput: raw_input,
        symptoms,
        diagnosis: "result here",
        severity: "LOW",
        explanation: "...",
        immediateAdvice: "...",
        warningSignss: [],
        aiSource: "tensorflow",
        fullResult: {},
      },
    });
  },
  {
    connection: { host: "localhost", port: 6379 },
  },
);
