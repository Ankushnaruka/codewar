#!/bin/bash
set -e

g++ main.cpp -O2 -std=c++17 -o main
timeout 2 ./main < input.txt > output.txt
echo "Execution finished. Output written to output.txt"