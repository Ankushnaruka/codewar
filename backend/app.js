import express from "express";
import { cppQueue , pythonQueue} from "./queue.js";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

app.post("/run", async (req, res) => {
  const { code, input, language } = req.body;

  let job;
  if (language === "cpp") {
    job = await cppQueue.add("compile", {
      language,
      code,
      input,
      jobId: uuidv4()
    });
  }
  else if (language === "python") {
    job = await pythonQueue.add("run", {
      language,
      code,
      input,
      jobId: uuidv4()
    });
  }
  
  res.json({ jobId: job.id , language: language});
});
app.get("/:lang/job/:id", async (req, res) => {
  let { lang, id } = req.params;
  let job;
  if (lang === "cpp") {
    job = await cppQueue.getJob(id);
  }
  else if (lang === "python") {
    job = await pythonQueue.getJob(id);
  }
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const state = await job.getState();
  if (state === "completed") {
    res.json({ state, output: job.returnvalue });
  } else {
    res.json({ state, output: job.returnvalue || null });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
