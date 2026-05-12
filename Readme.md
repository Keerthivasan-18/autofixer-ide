# AutoFixer AI

AutoFixer AI is an AI-powered Java debugging and correction platform that detects Java code errors, automatically fixes them, and provides detailed explanations using local AI models.

The project includes a custom-built frontend editor integrated with a Flask backend and AI reasoning engine.

---

# 🚀 Features

- Detects Java syntax and compilation errors
- Automatically fixes Java code
- Provides AI-generated explanations
- Uses local AI inference with Ollama
- Powered by Phi model
- Custom frontend code editor
- Real-time frontend and backend integration
- Project and file management support
- Clean UI using Tailwind CSS

---

# 🛠️ Tech Stack

## Frontend
- HTML
- Tailwind CSS
- JavaScript

## Backend
- Python
- Flask

## AI / ML
- Ollama
- Phi Model
- AI reasoning engine

---

# 🧠 How It Works

```text
User Writes Java Code
          ↓
Frontend Editor
          ↓
Flask Backend API
          ↓
Java Error Detection
          ↓
AI Reasoning Engine
          ↓
Automatic Code Correction
          ↓
Explanation Generation
          ↓
Corrected Code Returned
```

---

# 📂 Project Structure

```bash
AutoFixer-AI/
│
├── app.py                # Flask backend
├── autofixer.py          # AI fixing logic
├── templates/
│   └── index.html
│
├── static/
│   ├── script.js
│   ├── style.css
│
├── projects/
├── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/your-username/autofixer-ai.git
cd autofixer-ai
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Install Ollama

Download and install Ollama:

https://ollama.com

---

## 4. Run Phi Model

```bash
ollama run phi
```

---

## 5. Start Flask Server

```bash
python app.py
```

---

# 🌐 Run Project

Open browser:

```text
http://127.0.0.1:5000
```

---

# ✨ Key Capabilities

## ✅ Automatic Java Error Fixing
Detects and fixes:
- Syntax errors
- Missing semicolons
- Type mismatches
- Variable scope issues
- Compilation problems

## ✅ AI Explanations
Explains:
- Why the error occurred
- What was corrected
- How the fix works

## ✅ Custom Frontend Editor
Includes:
- File management
- API integration
- Code editing interface
- Fix visualization

## ✅ Local AI Processing
Uses local AI models through Ollama for:
- Faster responses
- Offline usage
- Privacy
- Lightweight deployment

---

# 🔮 Future Improvements

- AST-based Java parsing
- Runtime error detection
- Code optimization suggestions
- Unit test generation
- Multi-language support
- VS Code extension
- Authentication system

---

# 🎯 Learning Outcomes

This project helped in learning:
- Full-stack development
- Flask API development
- Frontend and backend integration
- AI model integration
- Prompt engineering
- Java debugging systems
- Developer tooling concepts

---

# 👨‍💻 Author

KEERTHIVASAN G

---

# 📜 License

MIT License
