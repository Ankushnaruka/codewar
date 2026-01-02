#!/bin/bash

g++ main.cpp -O2 -std=c++17 -o main 2> compile_error.txt

if [ $? -ne 0 ]; then
  cat compile_error.txt > output.txt
  echo "0" > time.txt
  exit 0
fi

START_TIME=$(date +%s%N)
timeout 2 ./main < input.txt > output.txt 2>&1
END_TIME=$(date +%s%N)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
  echo "Time Limit Exceeded" > output.txt
fi

# Calculate execution time in milliseconds
EXECUTION_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
echo "$EXECUTION_TIME" > time.txt

echo "C++ Execution finished. Output written to output.txt"