import { Queue } from "bullmq";

export const connection = {
  host: "127.0.0.1",
  port: 6379
};

export const cppQueue = new Queue("cpp-jobs", { connection });
export const pythonQueue = new Queue("python-jobs", { connection });
