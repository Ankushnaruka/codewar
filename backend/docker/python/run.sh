#!/bin/bash

timeout 2s python3 main.py < input.txt > output.txt 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
  echo "Time Limit Exceeded" > output.txt
fi
echo "Execution finished. Output written to output.txt"