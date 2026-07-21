import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../src/db.ts";
import { predict_disease } from "../ml/predict.ts";
import {
  map_severity,
  get_specialization,
  SYSTEM_PROMPT,
} from "../config/diagnosis_helpers.ts";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const gemini = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

// in-memory cache of gemini-format history, backed by the database
const conversation: Record<string, any[]> = {};

// pulls saved messages from DB into memory if this patient's history isn't cached
// (handles server restarts, since in-memory alone is wiped then)
async function load_history(patient_id: string) {
  if (conversation[patient_id]) return conversation[patient_id];

  const saved = await prisma.chatMessage.findMany({
    where: { patient_id },
    orderBy: { createdAt: "asc" },
  });

  conversation[patient_id] = saved.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  return conversation[patient_id];
}

export const chat = async (req: Request, res: Response) => {
  try {
    const patient_id = req.user?.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const history = await load_history(patient_id!);

    const chat_session = gemini.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        {
          role: "model",
          parts: [{ text: "Understood. I will collect symptoms carefully." }],
        },
        ...history,
      ],
    });

    const result = await chat_session.sendMessage(message);
    const gemini_reply = result.response.text();

    // persist the patient's message
    await prisma.chatMessage.create({
      data: { patient_id: patient_id!, role: "user", content: message },
    });
    history.push({ role: "user", parts: [{ text: message }] });

    if (gemini_reply.includes("DIAGNOSIS_READY")) {
      return await run_diagnosis(patient_id!, gemini_reply, res);
    }

    // persist gemini's follow-up question
    await prisma.chatMessage.create({
      data: { patient_id: patient_id!, role: "model", content: gemini_reply },
    });
    history.push({ role: "model", parts: [{ text: gemini_reply }] });

    return res.status(200).json({
      success: true,
      type: "question",
      message: gemini_reply,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

// GET /api/diagnosis/history — rehydrates the chat on page load/refresh
export const get_history = async (req: Request, res: Response) => {
  try {
    const patient_id = req.user?.id;

    const messages = await prisma.chatMessage.findMany({
      where: { patient_id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        role: m.role === "model" ? "assistant" : "user",
        content: m.content,
        timestamp: m.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "could not load chat history",
    });
  }
};

export const run_diagnosis = async (
  patient_id: string,
  gemini_reply: string,
  res: Response,
) => {
  try {
    const json_start = gemini_reply.indexOf("{");
    const json_end = gemini_reply.lastIndexOf("}") + 1;
    const json_string = gemini_reply.slice(json_start, json_end);
    const { symptoms, duration, severity } = JSON.parse(json_string);

    const tf_results = predict_disease(symptoms);
    const top = tf_results[0];

    const explanation_prompt = `
      A patient described these symptoms: ${symptoms.join(", ")}
      Duration: ${duration}
      Severity: ${severity}

      Medical analysis shows: ${top.disease} (${top.percentage} confidence)

      Write a SHORT friendly explanation (max 80 words):
      - What this condition likely is
      - Why their symptoms match
      - How urgent it is to see a doctor
      - One thing they can do right now

      End with: "I have found doctors who can help you nearby."
      Use simple language. Be empathetic. No medical jargon.
    `;

    const explanation_result = await gemini.generateContent(explanation_prompt);
    const explanation = explanation_result.response.text();

    const specialization = get_specialization(top.disease);

    const doctors = await prisma.doctor.findMany({
      where: {
        specialization,
        status: "APPROVED",
        available: true,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        specialization: true,
        location: true,
        rating: true,
        yearsExperience: true,
      },
      take: 5,
    });

    const hospitals = await prisma.hospital.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        name: true,
        address: true,
        state: true,
        phone: true,
      },
      take: 3,
    });

    await prisma.healthRecord.create({
      data: {
        patient_id,
        symptoms,
        rawInput: symptoms.join(", "),
        diagnosis: top.disease,
        severity: map_severity(severity),
        explanation,
        immediateAdvice: top.precautions[0] || "See a doctor",
        warningSignss: top.precautions,
        aiSource: "gemini+tensorflow",
        fullResult: tf_results as any,
      },
    });

    // session complete — clear both memory cache and persisted chat history
    delete conversation[patient_id];
    await prisma.chatMessage.deleteMany({ where: { patient_id } });

    return res.status(200).json({
      success: true,
      type: "diagnosis",
      data: {
        diagnosis: top.disease,
        severity: map_severity(severity),
        explanation,
        immediateAdvice: top.precautions[0] || "See a doctor",
        warningSignss: top.precautions,
        symptoms,
        recommended_doctors: doctors,
        recommended_hospitals: hospitals,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong during diagnosis",
    });
  }
};
