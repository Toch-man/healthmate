import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../src/db.ts";
import { predict_disease } from "../ml/predict.ts";
import {
  map_severity,
  get_specialization,
  SYSTEM_PROMPT,
} from "../config/diagnosis_helpers.ts";
import { find_patient } from "../services/patient_service.ts";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const gemini = genai.getGenerativeModel({
  model: `${process.env.GEMINI_MODEL}`,
});

const conversation: Record<string, any[]> = {};

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
    const user_id = req.user?.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const patient = await find_patient(user_id!);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }
    const patient_id = patient.id;

    const history = await load_history(patient_id);

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

    await prisma.chatMessage.create({
      data: { patient_id, role: "user", content: message },
    });
    history.push({ role: "user", parts: [{ text: message }] });

    if (gemini_reply.includes("DIAGNOSIS_READY")) {
      return await run_diagnosis(patient_id, gemini_reply, res);
    }

    await prisma.chatMessage.create({
      data: { patient_id, role: "model", content: gemini_reply },
    });
    history.push({ role: "model", parts: [{ text: gemini_reply }] });

    return res.status(200).json({
      success: true,
      type: "question",
      message: gemini_reply,
    });
  } catch (error) {
    console.error("DIAGNOSIS CHAT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

export const get_history = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;

    const patient = await find_patient(user_id!);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { patient_id: patient.id },
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
    console.error("DIAGNOSIS HISTORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "could not load chat history",
    });
  }
};

// POST /api/diagnosis/new — explicitly clears conversation so the
// patient can start a completely fresh symptom check, unrelated to
// any previous diagnosis. Triggered only by the "Start new chat"
// button, never automatically.
export const start_new_conversation = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;

    const patient = await find_patient(user_id!);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }

    delete conversation[patient.id];
    await prisma.chatMessage.deleteMany({ where: { patient_id: patient.id } });

    return res.status(200).json({
      success: true,
      message: "started a new conversation",
    });
  } catch (error) {
    console.error("START NEW CONVERSATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
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

    // conversation intentionally NOT cleared here — patient can keep
    // chatting with full context; they clear it themselves via the
    // "Start new chat" button, which calls start_new_conversation above

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
        recommended_doctors_message:
          doctors.length === 0
            ? `No ${specialization}s are available on HealthMate right now. Please check back later or visit the nearest hospital.`
            : null,
        recommended_hospitals: hospitals,
        recommended_hospitals_message:
          hospitals.length === 0
            ? "No approved hospitals are listed on HealthMate right now."
            : null,
      },
    });
  } catch (error) {
    console.error("DIAGNOSIS RUN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong during diagnosis",
    });
  }
};
