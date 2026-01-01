import { Worker } from "bullmq";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { connection } from "./queue.js";

new Worker(
  "cpp-jobs",
  async job => {
    const { code, input } = job.data;

    const jobDir = path.join("tmp","cpp" ,job.id.toString());
    fs.mkdirSync(jobDir, { recursive: true });

    fs.writeFileSync(path.join(jobDir, "main.cpp"), code);
    fs.writeFileSync(path.join(jobDir, "input.txt"), input || "");
    fs.mkdirSync("tmp", { recursive: true });
    
    execSync(
    `docker run --rm --cpus="1" --memory="256m" --network none -v "${process.cwd()}\\${jobDir}:/app" cpp-runner`,
    { stdio: "inherit" }
    );


    const output = fs.readFileSync(
      path.join(jobDir, "output.txt"),
      "utf-8"
    );

    return output;
  },
  { connection }
);

new Worker(
  "python-jobs",
  async job => {
    const { code, input } = job.data;
    const jobDir = path.join("tmp","python", job.id.toString());
    fs.mkdirSync(jobDir, { recursive: true });
    fs.writeFileSync(path.join(jobDir, "main.py"), code);
    fs.writeFileSync(path.join(jobDir, "input.txt"), input || "");
    fs.mkdirSync("tmp", { recursive: true });
    execSync(
      `docker run --rm --cpus="1" --memory="256m" --network none -v "${process.cwd()}\\${jobDir}:/app" python-runner`,
      { stdio: "inherit" }
    );
    const output = fs.readFileSync(
      path.join(jobDir, "output.txt"),
      "utf-8"
    );
    return output;
  }
  , { connection }
);