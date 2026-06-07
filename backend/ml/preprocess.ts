import fs from "fs";
import path, { dirname } from "path";
import Papa from "papaparse";
import { fileURLToPath } from "url";

// fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// STEP 1 — READ ALL CSV FILES
// ============================================

// fs.readFileSync reads the file from your computer
// path.join builds the correct file path regardless of OS
const dataset_file = fs.readFileSync(
  path.join(__dirname, "data/dataset.csv"),
  "utf8", // read as text not binary
);

const severity_file = fs.readFileSync(
  path.join(__dirname, "data/symptom_severity.csv"),
  "utf8",
);

const description_file = fs.readFileSync(
  path.join(__dirname, "data/symptom_description.csv"),
  "utf8",
);

const precaution_file = fs.readFileSync(
  path.join(__dirname, "data/symptom_precaution.csv"),
  "utf8",
);

// ============================================
// STEP 2 — PARSE CSV FILES INTO JAVASCRIPT OBJECTS
// ============================================

// Papa.parse converts CSV text into JavaScript objects
// header:true means first row is column names not data
// skipEmptyLines removes blank rows

const dataset_parsed = Papa.parse(dataset_file, {
  header: true,
  skipEmptyLines: true,
}).data as any[];
// dataset_parsed now looks like:
// [
//   { Disease: "Fungal infection", Symptom_1: "itching", Symptom_2: "skin_rash", ... },
//   { Disease: "Allergy", Symptom_1: "sneezing", Symptom_2: "chills", ... },
// ]

const severity_parsed = Papa.parse(severity_file, {
  header: true,
  skipEmptyLines: true,
}).data as any[];
// severity_parsed looks like:
// [
//   { Symptom: "itching", weight: "1" },
//   { Symptom: "skin_rash", weight: "3" },
//   { Symptom: "fever", weight: "4" },
// ]

const description_parsed = Papa.parse(description_file, {
  header: true,
  skipEmptyLines: true,
}).data as any[];
// description_parsed looks like:
// [
//   { Disease: "Fungal infection", Description: "Fungal infection is..." },
// ]

const precaution_parsed = Papa.parse(precaution_file, {
  header: true,
  skipEmptyLines: true,
}).data as any[];
// precaution_parsed looks like:
// [
//   { Disease: "Fungal infection", Precaution_1: "bath twice", Precaution_2: "..." },
// ]

// ============================================
// STEP 3 — BUILD SYMPTOM SEVERITY MAP
// ============================================
// we want to look up severity by symptom name quickly
// so we convert the array into an object (map)

const severity_map: Record<string, number> = {};

severity_parsed.forEach((row) => {
  const symptom = row.Symptom?.trim().toLowerCase();
  const weight = parseInt(row.weight);
  if (symptom && !isNaN(weight)) {
    severity_map[symptom] = weight;
  }
});
// severity_map now looks like:
// {
//   "itching": 1,
//   "skin_rash": 3,
//   "fever": 4,
//   "chest_pain": 7,
// }
// now we can do severity_map["fever"] → 4 instantly

// ============================================
// STEP 4 — BUILD DISEASE DESCRIPTION MAP
// ============================================

const description_map: Record<string, string> = {};

description_parsed.forEach((row) => {
  const disease = row.Disease?.trim();
  const description = row.Description?.trim();
  if (disease && description) {
    description_map[disease] = description;
  }
});
// description_map["Pneumonia"] → "Pneumonia is a lung infection..."

// ============================================
// STEP 5 — BUILD DISEASE PRECAUTION MAP
// ============================================

const precaution_map: Record<string, string[]> = {};

precaution_parsed.forEach((row) => {
  const disease = row.Disease?.trim();
  if (!disease) return;

  // collect all 4 precautions, filter out empty ones
  const precautions = [
    row.Precaution_1,
    row.Precaution_2,
    row.Precaution_3,
    row.Precaution_4,
  ]
    .map((p) => p?.trim())
    .filter(Boolean); // removes empty/undefined

  precaution_map[disease] = precautions;
});
// precaution_map["Pneumonia"] → ["rest", "drink fluids", "see doctor", "take meds"]

// ============================================
// STEP 6 — COLLECT ALL UNIQUE SYMPTOMS AND DISEASES
// ============================================

const symptom_set = new Set<string>();
const disease_set = new Set<string>();

dataset_parsed.forEach((row) => {
  // trim removes whitespace, toLowerCase makes consistent
  const disease = row.Disease?.trim();
  if (disease) disease_set.add(disease);

  // loop through all 14 symptom columns
  // we use 17 to be safe since some datasets go higher
  for (let i = 1; i <= 17; i++) {
    const symptom = row[`Symptom_${i}`]?.trim().toLowerCase();
    if (symptom && symptom !== "") {
      symptom_set.add(symptom);
    }
  }
});

// convert sets to sorted arrays
// sorted so indexes are always consistent
// symptom at index 0 is always the same every run
export const symptom_list = Array.from(symptom_set).sort();
export const disease_list = Array.from(disease_set).sort();

console.log(`total symptoms: ${symptom_list.length}`); // should be ~132
console.log(`total diseases: ${disease_list.length}`); // should be 41

// ============================================
// STEP 7 — CONVERT DATASET TO NUMBERS
// ============================================

export const prepare_training_data = () => {
  const inputs: number[][] = []; // symptom vectors going in
  const outputs: number[][] = []; // disease vectors going out

  dataset_parsed.forEach((row) => {
    const disease = row.Disease?.trim();
    if (!disease) return; // skip empty rows

    // ---- BUILD INPUT VECTOR ----
    // array of zeros, one slot per symptom
    // [0, 0, 0, 0, 0, ...] 132 zeros
    const input_vector = new Array(symptom_list.length).fill(0);

    for (let i = 1; i <= 17; i++) {
      const symptom = row[`Symptom_${i}`]?.trim().toLowerCase();
      if (!symptom || symptom === "") continue; // skip empty cells

      const symptom_index = symptom_list.indexOf(symptom);
      if (symptom_index === -1) continue; // skip if not in our list

      // instead of putting 1, put the severity weight
      // chest_pain (weight 7) matters more than itching (weight 1)
      const severity_weight = severity_map[symptom] || 1;
      input_vector[symptom_index] = severity_weight;
    }
    // input_vector now looks like:
    // [0, 0, 4, 0, 7, 0, 1, 0, ...]
    //        ↑     ↑     ↑
    //      fever chest  itching
    //      w=4   w=7    w=1

    // ---- BUILD OUTPUT VECTOR (ONE HOT ENCODING) ----
    // array of zeros, one slot per disease
    // put 1 only where the disease is
    const output_vector = new Array(disease_list.length).fill(0);
    const disease_index = disease_list.indexOf(disease);
    if (disease_index === -1) return; // skip unknown diseases
    output_vector[disease_index] = 1;
    // output_vector for Pneumonia (index 25) looks like:
    // [0, 0, 0, ..., 0, 1, 0, ..., 0]
    //                    ↑
    //               index 25 = 1

    inputs.push(input_vector);
    outputs.push(output_vector);
  });

  console.log(`training examples: ${inputs.length}`);
  return { inputs, outputs };
};

// ============================================
// STEP 8 — SAVE EVERYTHING WE NEED LATER
// ============================================
// we need symptom_list and disease_list during prediction
// save them as JSON files so predict.ts can load them

export const save_metadata = () => {
  fs.writeFileSync(
    path.join(__dirname, "symptom_list.json"),
    JSON.stringify(symptom_list, null, 2),
  );

  fs.writeFileSync(
    path.join(__dirname, "disease_list.json"),
    JSON.stringify(disease_list, null, 2),
  );

  fs.writeFileSync(
    path.join(__dirname, "severity_map.json"),
    JSON.stringify(severity_map, null, 2),
  );

  fs.writeFileSync(
    path.join(__dirname, "description_map.json"),
    JSON.stringify(description_map, null, 2),
  );

  fs.writeFileSync(
    path.join(__dirname, "precaution_map.json"),
    JSON.stringify(precaution_map, null, 2),
  );

  console.log("all metadata saved to JSON files");
};
prepare_training_data();
save_metadata();
