import express from "express";
import rateLimit from "express-rate-limit";
import { cppQueue , pythonQueue} from "./queue.js";
import { QueueEvents } from "bullmq";
import { connection } from "./queue.js";
import { v4 as uuidv4 } from "uuid";

const cppQueueEvents = new QueueEvents("cpp-jobs", { connection });
const pythonQueueEvents = new QueueEvents("python-jobs", { connection });

// Rate limiting middleware
const runLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 6, // limit each IP to 6 requests per windowMs
  message: "Too many code execution requests, please try again later",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();
app.use(express.json());
app.use("/run", runLimiter);

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
