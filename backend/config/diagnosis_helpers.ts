export const map_severity = (severity: string) => {
  const s = severity.toLowerCase();
  if (s.includes("emergency") || s.includes("critical") || s.includes("severe"))
    return "EMERGENCY";
  if (s.includes("high") || s.includes("urgent")) return "HIGH";
  if (s.includes("moderate")) return "MEDIUM";
  return "LOW";
};

// maps disease to doctor specialization
// NOTE: all keys are lowercase — always lowercase the incoming disease
// name before lookup, regardless of what casing Gemini/the model returns
export const get_specialization = (disease: string): string => {
  const map: Record<string, string> = {
    pneumonia: "Pulmonologist",
    "bronchial asthma": "Pulmonologist",
    tuberculosis: "Pulmonologist",
    "heart attack": "Cardiologist",
    hypertension: "Cardiologist",
    diabetes: "Endocrinologist",
    hypothyroidism: "Endocrinologist",
    hyperthyroidism: "Endocrinologist",
    malaria: "General Physician",
    dengue: "General Physician",
    typhoid: "General Physician",
    "chicken pox": "General Physician",
    "common cold": "General Physician",
    migraine: "Neurologist",
    paralysis: "Neurologist",
    jaundice: "Gastroenterologist",
    "hepatitis a": "Gastroenterologist",
    "hepatitis b": "Gastroenterologist",
    "hepatitis c": "Gastroenterologist",
    "hepatitis d": "Gastroenterologist",
    "hepatitis e": "Gastroenterologist",
    gastroenteritis: "Gastroenterologist",
    "peptic ulcer disease": "Gastroenterologist",
    "fungal infection": "Dermatologist",
    acne: "Dermatologist",
    psoriasis: "Dermatologist",
    impetigo: "Dermatologist",
    allergy: "Immunologist",
    arthritis: "Rheumatologist",
    osteoarthritis: "Rheumatologist",
    "cervical spondylosis": "Orthopedist",
    "varicose veins": "Vascular Surgeon",
    "urinary tract infection": "Urologist",
    "dimorphic hemorrhoids": "Proctologist",
    "drug reaction": "General Physician",
    "chronic cholestasis": "Hepatologist",
    gerd: "Gastroenterologist",
  };

  return map[disease.toLowerCase()] || "General Physician";
};

export const SYSTEM_PROMPT = `You are a medical symptom collector for a health app in Nigeria.
Your job is to collect symptoms from patients through friendly conversation.

Rules:
- Ask ONE question at a time
- Be empathetic and friendly
- Use simple everyday language, no medical jargon
- Ask about: what they feel, how long, how severe, any other symptoms
- Collect at least 4-5 symptoms before diagnosing
- When you have enough info respond ONLY with:

DIAGNOSIS_READY
{
  "symptoms": ["symptom1", "symptom2"],
  "duration": "2 days",
  "severity": "low" | "moderate" | "high" | "emergency"
}

The "severity" field must be EXACTLY one of these four words: low, moderate, high, emergency.
Do not use any other wording (e.g. never write "severe", "critical", "mild") — pick
the closest of the four allowed words.

Map patient language to these exact symptom names:
fever, cough, chest_pain, headache, fatigue, nausea,
vomiting, diarrhea, shortness_of_breath, skin_rash,
joint_pain, back_pain, abdominal_pain, loss_of_appetite,
high_fever, chills, sweating, weight_loss, breathlessness,
yellowish_skin, itching, muscle_weakness, anxiety, depression

Only use symptom names from the list above.`;
