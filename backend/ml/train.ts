import * as tf from "@tensorflow/tfjs-node";
import {
  prepare_training_data,
  symptom_list,
  disease_list,
} from "./preprocess.ts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const train = async () => {
  // ============================================
  // STEP 1 — GET THE PREPARED DATA
  // ============================================
  // this calls the function we wrote in preprocess.ts
  // returns inputs (symptoms) and outputs (diseases)
  // both are number[][] — arrays of number arrays

  console.log("loading training data...");
  const { inputs, outputs } = prepare_training_data();

  // STEP 2 — CONVERT TO TENSORS
  // TensorFlow cannot work with plain JS arrays
  // it needs special objects called tensors
  // tf.tensor2d converts a 2D array into a tensor
  // "2d" means 2 dimensional — array of arrays

  console.log("converting to tensors...");

  const input_tensor = tf.tensor2d(inputs);
  // input_tensor shape: [4920, 131]
  // 4920 training examples, each with 131 symptom values
  // shape tells TensorFlow:
  // "there are 4920 rows, each row has 131 numbers"

  const output_tensor = tf.tensor2d(outputs);
  // output_tensor shape: [4920, 41]
  // 4920 training examples, each with 41 disease slots

  console.log("input shape:", input_tensor.shape); // [4920, 131]
  console.log("output shape:", output_tensor.shape); // [4920, 41]

  // ============================================
  // STEP 3 — BUILD THE NEURAL NETWORK
  // ============================================
  // tf.sequential means layers connect in a straight line
  // output of layer 1 → input of layer 2 → etc

  console.log("building model...");

  const model = tf.sequential();

  // LAYER 1 — input layer
  // inputShape tells TensorFlow what shape to expect coming in
  // must match your symptom count (131)
  // units: 128 — 128 neurons in this layer
  // activation relu — removes negative numbers
  model.add(
    tf.layers.dense({
      inputShape: [symptom_list.length], // 131
      units: 128,
      activation: "relu",
    }),
  );

  // LAYER 2 — hidden layer
  // takes 128 numbers from layer 1
  // produces 64 numbers
  // no inputShape needed — TensorFlow knows from previous layer
  model.add(
    tf.layers.dense({
      units: 64,
      activation: "relu",
    }),
  );

  // DROPOUT LAYER
  // randomly zeros out 20% of neurons during training
  // prevents model from memorizing training data
  // rate: 0.2 means 20% chance each neuron is zeroed
  model.add(
    tf.layers.dropout({
      rate: 0.2,
    }),
  );

  // LAYER 3 — hidden layer
  // takes 64 numbers
  // produces 32 numbers
  model.add(
    tf.layers.dense({
      units: 32,
      activation: "relu",
    }),
  );

  // OUTPUT LAYER
  // units must equal number of diseases (41)
  // one neuron per disease
  // softmax converts raw numbers to probabilities
  // all 41 probabilities add up to 1.0
  model.add(
    tf.layers.dense({
      units: disease_list.length, // 41
      activation: "softmax",
    }),
  );

  // ============================================
  // STEP 4 — COMPILE THE MODEL
  // ============================================
  // compile sets up how the model learns

  model.compile({
    // adam — most popular optimizer
    // adjusts weights after each batch
    // smarter than basic gradient descent
    // automatically adjusts learning speed
    optimizer: "adam",

    // categoricalCrossentropy — measures mistakes
    // used when output is categories (diseases)
    // higher number = model was more wrong
    // lower number = model was more right
    loss: "categoricalCrossentropy",

    // accuracy — what percentage did model get right
    // just for us to watch during training
    metrics: ["accuracy"],
  });

  // print model summary — shows all layers and parameters
  model.summary();

  // ============================================
  // STEP 5 — TRAIN THE MODEL
  // ============================================

  console.log("training started...");

  await model.fit(input_tensor, output_tensor, {
    // epochs — how many times to go through ALL training data
    // each epoch the model sees all 4920 examples once
    // after each epoch weights are updated
    epochs: 150,

    // batchSize — how many examples to process at once
    // instead of all 4920 at once (too slow)
    // process 32 at a time, update weights, next 32 etc
    batchSize: 32,

    // validationSplit — hold back 20% of data
    // model never trains on this 20%
    // used to check if model works on unseen data
    // if validation accuracy is high → model generalizes well
    // if training high but validation low → overfitting
    validationSplit: 0.2,

    // callbacks — functions called during training
    // onEpochEnd runs after each epoch
    callbacks: {
      onEpochEnd: (epoch: number, logs: any) => {
        // logs.acc = training accuracy
        // logs.val_acc = validation accuracy
        // logs.loss = training loss
        // logs.val_loss = validation loss
        console.log(
          `epoch ${epoch + 1}/150 | ` +
            `accuracy: ${(logs.acc * 100).toFixed(1)}% | ` +
            `val_accuracy: ${(logs.val_acc * 100).toFixed(1)}% | ` +
            `loss: ${logs.loss.toFixed(4)}`,
        );
      },
    },
  });

  // ============================================
  // STEP 6 — SAVE THE TRAINED MODEL
  // ============================================
  // save to disk so predict.ts can load it later
  // without saving you'd have to retrain every time

  const model_path = `file://${path.join(__dirname, "saved_model")}`;
  await model.save(model_path);

  console.log("model saved to ml/saved_model/");
  console.log("training complete!");

  // ============================================
  // STEP 7 — CLEAN UP TENSORS FROM MEMORY
  // ============================================
  // tensors live in GPU/CPU memory
  // must dispose them manually or you get memory leaks
  // TensorFlow does not garbage collect tensors automatically

  input_tensor.dispose();
  output_tensor.dispose();
};

// run the training
train().catch(console.error);
