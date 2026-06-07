export const map_severity = (severity: string) => {
  const s = severity.toLowerCase();
  if (s.includes("emergency")) return "EMERGENCY";
  if (s.includes("high")) return "HIGH";
  if (s.includes("moderate")) return "MEDIUM";
  return "LOW";
};

// maps disease to doctor specialization
export const get_specialization = (disease: string): string => {
  const map: Record<string, string> = {
    Pneumonia: "Pulmonologist",
    "Bronchial Asthma": "Pulmonologist",
    Tuberculosis: "Pulmonologist",
    "Heart Attack": "Cardiologist",
    Hypertension: "Cardiologist",
    Diabetes: "Endocrinologist",
    Hypothyroidism: "Endocrinologist",
    Hyperthyroidism: "Endocrinologist",
    Malaria: "General Physician",
    Dengue: "General Physician",
    Typhoid: "General Physician",
    "Chicken Pox": "General Physician",
    "Common Cold": "General Physician",
    Migraine: "Neurologist",
    Paralysis: "Neurologist",
    Jaundice: "Gastroenterologist",
    "Hepatitis A": "Gastroenterologist",
    "Hepatitis B": "Gastroenterologist",
    "Hepatitis C": "Gastroenterologist",
    "Hepatitis D": "Gastroenterologist",
    "Hepatitis E": "Gastroenterologist",
    Gastroenteritis: "Gastroenterologist",
    "Peptic Ulcer Disease": "Gastroenterologist",
    "Fungal infection": "Dermatologist",
    Acne: "Dermatologist",
    Psoriasis: "Dermatologist",
    Impetigo: "Dermatologist",
    Allergy: "Immunologist",
    Arthritis: "Rheumatologist",
    Osteoarthritis: "Rheumatologist",
    "Cervical Spondylosis": "Orthopedist",
    "Varicose Veins": "Vascular Surgeon",
    "Urinary Tract Infection": "Urologist",
    "Dimorphic Hemorrhoids": "Proctologist",
    "Drug Reaction": "General Physician",
    "Chronic Cholestasis": "Hepatologist",
    GERD: "Gastroenterologist",
  };

  return map[disease] || "General Physician";
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
  "severity": "moderate"
}

Map patient language to these exact symptom names:
fever, cough, chest_pain, headache, fatigue, nausea,
vomiting, diarrhea, shortness_of_breath, skin_rash,
joint_pain, back_pain, abdominal_pain, loss_of_appetite,
high_fever, chills, sweating, weight_loss, breathlessness,
yellowish_skin, itching, muscle_weakness, anxiety, depression

Only use symptom names from the list above.`;
