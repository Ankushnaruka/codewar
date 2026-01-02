#!/bin/bash

START_TIME=$(date +%s%N)
timeout 2s python3 main.py < input.txt > output.txt 2>&1
END_TIME=$(date +%s%N)

EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
  echo "Time Limit Exceeded" > output.txt
fi

# Calculate execution time in milliseconds
EXECUTION_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
echo "$EXECUTION_TIME" > time.txt

echo "Python Execution finished. Output written to output.txt"