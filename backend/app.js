import express from "express";
import { cppQueue , pythonQueue} from "./queue.js";
import { QueueEvents } from "bullmq";
import { connection } from "./queue.js";
import { v4 as uuidv4 } from "uuid";

const cppQueueEvents = new QueueEvents("cpp-jobs", { connection });
const pythonQueueEvents = new QueueEvents("python-jobs", { connection });

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
  
  // Wait for the job to complete
  try {
    const queueEvents = language === "cpp" ? cppQueueEvents : pythonQueueEvents;
    const result = await job.waitUntilFinished(queueEvents);
    res.json({ 
      state: "completed", 
      output: result.output, 
      executionTime: result.executionTime + "ms",
      jobId: job.id, 
      language: language 
    });
    
    // Delete the job after completion to save memory
    await job.remove();
  } catch (error) {
    // Delete the job even if it failed
    await job.remove();
    res.status(500).json({ error: "Job failed or was cancelled", details: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
