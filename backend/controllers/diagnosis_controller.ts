import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../src/db.ts";
import { predict_disease } from "../ml/predict.ts";
import {
  map_severity,
  get_specialization,
  SYSTEM_PROMPT,
} from "../config/diagnosis_helpers.ts";
//initialize gemini
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const gemini = genai.getGenerativeModel({ model: "gemini-pro" });

//system prompt
//inistructions to gemini ai

//store conversation per patient
//key = patient_id, value =message.history
const conversation: Record<string, any[]> = {};

//chat endpoint
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

    //get or create conversation history for this patient
    if (!conversation[patient_id!]) {
      conversation[patient_id!] = [];
    }
    const history = conversation[patient_id!];

    //build chat with history
    const chat_session = gemini.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        {
          role: "model",
          parts: [{ text: "Understood. I will collect symptoms carefully." }],
        },
        // then actual conversation so far
        ...history,
      ],
    });

    history.push({
      role: "user",
      parts: [{ text: message }],
    });

    //send to gemini
    const result = await chat_session.sendMessage(message);
    const gemini_reply = result.response.text();

    //check if  gemini have collected enough symptoms
    if (gemini_reply.includes("DIAGNOSIS_READY")) {
      return await run_diagnosis(patient_id!, gemini_reply, res);
    }

    //if gemini is still asking questions add its reply to history
    // so that  the next message has context
    history.push({
      role: "model",
      parts: [{ text: gemini_reply }],
    });

    //send question back to patient
    return res.status(200).json({
      success: true,
      type: "question",
      message: gemini_reply,
    });
  } catch (error) {
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
    //extract json gemini returned
    const json_start = gemini_reply.indexOf("{");
    const json_end = gemini_reply.indexOf("}");
    const json_string = gemini_reply.slice(json_start, json_end);
    const { symptoms, duration, severity } = JSON.parse(json_string);

    //send symptoms to tensflow model
    const tf_results = predict_disease(symptoms);
    // tf_results looks like this [
    //   { disease: "Pneumonia", confidence: 0.87, percentage: "87.0%", ... },
    //   { disease: "Bronchitis", confidence: 0.09, ... },
    //   { disease: "COVID-19", confidence: 0.02, ... },
    // ]

    const top = tf_results[0];

    //send diagnois back to gemini fr explanation

    const explanation_prompt = `
    A patient in Nigeria described these symptoms: ${symptoms.join(", ")}
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

    //find matching doctors from DB
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

    return res.status(200).json({
      success: true,
      type: "diagnosis",
      explanation,
      diagnosis: {
        top: top.disease,
        confidence: top.percentage,
        description: top.description,
        precautions: top.precautions,
        all_results: tf_results,
      },
      recommended_doctors: doctors,
      recommended_hospitals: hospitals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong during diagnosis",
    });
  }
};
