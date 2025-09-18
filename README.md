# Binary Brain 🧠

A modern web-based True/False quiz application designed to help students study effectively for exams. Upload your quiz files and get AI-powered explanations to deepen your understanding of the material.

## Features ✨

- 📁 **File Upload**: Drag & drop CSV or Excel files with your questions
- 🎯 **Interactive Quiz**: Clean interface with immediate visual feedback
- 🤖 **AI Explanations**: Get detailed explanations for any question using OpenAI
- 📊 **Progress Tracking**: Real-time statistics and comprehensive results
- ⌨️ **Keyboard Navigation**: Full keyboard support for efficient studying
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Quick Start 🚀

Copy `.env.example` to `.env` and add your OpenAI API key, then run `docker compose up -d` to start the application. The app will be available at `http://localhost:3001`.

## File Format 📋

Create a CSV or Excel file with two columns:
- **Column 1**: Question text
- **Column 2**: Correct answer

Supported answer formats: `true/false`, `1/0`, `ja/nein`, `richtig/falsch` (case insensitive)

Example:
```csv
"The Earth is round",true
"Water boils at 50°C",false
"Paris is the capital of France",ja
```

## Tech Stack 💻

Built with Vue 3, TypeScript, Tailwind CSS, Pinia, and OpenAI integration for a modern, maintainable learning experience.