# AutoFixer IDE with AI/ML Integration 🤖

A modern, AI-powered IDE for Java development with intelligent code assistance, error detection, and automatic code generation.

## 🚀 NEW AI/ML Features

### 1. **AI Error Detection** 🐛
- Real-time syntax error detection
- Semantic error identification
- Warning for best practice violations
- Visual error highlighting in code editor
- Jump-to-error functionality

### 2. **Smart Code Suggestions** 💡
- Context-aware code completion
- AI-powered snippet suggestions
- Intelligent method recommendations
- Keyboard shortcut: **Ctrl + Space**

### 3. **AI Code Generation** ✨
- Generate code from natural language descriptions
- Support for common patterns (loops, arrays, classes)
- Template-based code scaffolding
- Keyboard shortcut: **Ctrl + Shift + G**

### 4. **Intelligent Code Review** 📝
- Automated code quality analysis
- Style and convention checks
- Best practice recommendations
- Performance optimization suggestions
- Code quality scoring (0-100)
- Keyboard shortcut: **Ctrl + Shift + R**

### 5. **Auto-Fix** 🔧
- Automatic error correction
- Missing semicolon detection and addition
- Code formatting improvements
- One-click fix application
- Keyboard shortcut: **Ctrl + Shift + F**

## 📦 Installation

### Backend Setup

1. **Install Python** (3.8 or higher)

2. **Install dependencies**
   ```bash
   pip install Flask==3.0.0
   pip install flask-cors==4.0.0
   ```

3. **Run the AI-powered backend**
   ```bash
   python app_with_ai.py
   ```

### Frontend Setup

1. **Replace your script.js**
   - Use `script_with_ai.js` instead of `script.js`
   - Rename `script_with_ai.js` to `script.js`

2. **Open the IDE**
   ```bash
   python -m http.server 8000
   ```

3. **Access at** `http://localhost:8000`

## 🎯 How to Use AI Features

### AI Menu (Top Toolbar)
Click the "AI" button (🧠 icon) in the toolbar to access:
- Generate Code
- Get Suggestions
- Review Code
- Auto Fix
- Check Errors

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl + Space` | Get AI code suggestions |
| `Ctrl + Shift + G` | Generate code from description |
| `Ctrl + Shift + R` | Review current code |
| `Ctrl + Shift + F` | Auto-fix errors |

### Example Workflows

#### 1. Generate Code
```
1. Press Ctrl + Shift + G
2. Type: "hello world"
3. AI generates complete Java code
4. Code is automatically inserted
```

#### 2. Get Suggestions
```
1. Start typing: "System.out"
2. Press Ctrl + Space
3. See AI suggestions popup
4. Click to apply suggestion
```

#### 3. Auto-Fix Errors
```
1. Write code with errors (e.g., missing semicolons)
2. Red dots appear on error lines
3. Press Ctrl + Shift + F
4. Errors are automatically fixed
```

#### 4. Code Review
```
1. Write your Java code
2. Press Ctrl + Shift + R
3. View quality score and suggestions
4. See improvement recommendations
```

## 📡 AI API Endpoints

### Error Detection
```
POST /api/ai/detect-errors
Body: { "code": "your java code" }
Response: { "errors": [...], "count": 2 }
```

### Code Suggestions
```
POST /api/ai/suggestions
Body: { "code": "...", "cursor_line": 5 }
Response: { "suggestions": [...] }
```

### Code Generation
```
POST /api/ai/generate-code
Body: { "description": "calculator", "language": "java" }
Response: { "code": "...", "description": "..." }
```

### Code Review
```
POST /api/ai/review-code
Body: { "code": "your java code" }
Response: { "score": 85, "suggestions": [...] }
```

### Auto-Fix
```
POST /api/ai/fix-code
Body: { "code": "code with errors" }
Response: { "fixed_code": "...", "fixes_applied": [...] }
```

## 🔧 Integrating Real AI Models

The current implementation uses rule-based AI for demo purposes. To integrate real AI models:

### Option 1: OpenAI API

```python
import openai

openai.api_key = "your-api-key"

def generate_code_from_description(description, language='java'):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a Java code generator."},
            {"role": "user", "content": f"Generate {language} code for: {description}"}
        ]
    )
    return {
        'success': True,
        'code': response.choices[0].message.content
    }
```

**Install:**
```bash
pip install openai
```

### Option 2: Anthropic Claude API

```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

def generate_code_from_description(description, language='java'):
    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": f"Generate {language} code for: {description}"}
        ]
    )
    return {
        'success': True,
        'code': message.content[0].text
    }
```

**Install:**
```bash
pip install anthropic
```

### Option 3: Hugging Face Models

```python
from transformers import pipeline

code_generator = pipeline("text-generation", model="Salesforce/codegen-350M-mono")

def generate_code_from_description(description, language='java'):
    prompt = f"// {description}\n"
    result = code_generator(prompt, max_length=200)
    return {
        'success': True,
        'code': result[0]['generated_text']
    }
```

**Install:**
```bash
pip install transformers torch
```

### Option 4: Local LLM (Ollama)

```python
import requests

def generate_code_from_description(description, language='java'):
    response = requests.post('http://localhost:11434/api/generate',
        json={
            "model": "codellama",
            "prompt": f"Generate {language} code for: {description}",
            "stream": False
        })
    return {
        'success': True,
        'code': response.json()['response']
    }
```

**Setup:**
```bash
# Install Ollama from https://ollama.ai
ollama pull codellama
```

## 🧪 Training Custom Models

### For Code Error Detection

```python
# Example using scikit-learn
from sklearn.ensemble import RandomForestClassifier
import pickle

# Train on dataset of code with labeled errors
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save model
with open('error_detector.pkl', 'wb') as f:
    pickle.dump(model, f)

# Use in API
def detect_java_errors(code):
    with open('error_detector.pkl', 'rb') as f:
        model = pickle.load(f)
    
    features = extract_features(code)
    predictions = model.predict(features)
    return predictions
```

### For Code Completion

```python
# Using TensorFlow/Keras
from tensorflow import keras

# Load pre-trained model
model = keras.models.load_model('code_completion_model.h5')

def generate_code_suggestions(code, cursor_line):
    # Tokenize and encode
    encoded = tokenizer.encode(code)
    
    # Predict next tokens
    predictions = model.predict(encoded)
    
    # Decode suggestions
    suggestions = tokenizer.decode(predictions)
    return suggestions
```

## 📊 Sample Datasets for Training

- **CodeSearchNet**: https://github.com/github/CodeSearchNet
- **Java Code Examples**: https://github.com/TheAlgorithms/Java
- **BigCode Dataset**: https://huggingface.co/bigcode
- **Stack Overflow Data**: https://archive.org/details/stackexchange

## 🎓 Advanced AI Integration Ideas

1. **Code Smell Detection**
   - Identify anti-patterns
   - Suggest refactoring

2. **Documentation Generator**
   - Auto-generate JavaDoc comments
   - Create README files

3. **Test Case Generation**
   - Generate JUnit tests
   - Create edge cases

4. **Code Translation**
   - Java to Python conversion
   - Legacy code modernization

5. **Performance Optimization**
   - Identify bottlenecks
   - Suggest optimizations

6. **Security Analysis**
   - Detect vulnerabilities
   - Recommend fixes

## 🔑 Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
HUGGINGFACE_TOKEN=your-hf-token
```

Load in Python:

```python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
```

## 📈 Performance Tips

1. **Cache AI Responses**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=100)
   def generate_code_cached(description):
       return generate_code_from_description(description)
   ```

2. **Async Processing**
   ```python
   import asyncio
   
   async def ai_detect_errors_async(code):
       # Process in background
       return await async_ai_call(code)
   ```

3. **Rate Limiting**
   ```python
   from flask_limiter import Limiter
   
   limiter = Limiter(app, default_limits=["100 per hour"])
   
   @app.route('/api/ai/generate-code')
   @limiter.limit("10 per minute")
   def ai_generate():
       pass
   ```

## 🐛 Troubleshooting

**AI Features Not Working:**
- Check if backend is running
- Verify API endpoints are accessible
- Check browser console for errors

**Slow AI Responses:**
- Use caching
- Implement async processing
- Consider local models

**High API Costs:**
- Use local models (Ollama, Hugging Face)
- Implement request caching
- Add rate limiting

## 📚 Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [TensorFlow Tutorials](https://www.tensorflow.org/tutorials)
- [PyTorch Examples](https://pytorch.org/tutorials/)

## 🎉 What's New vs Basic Version

| Feature | Basic | AI-Enhanced |
|---------|-------|-------------|
| Error Detection | ❌ | ✅ Real-time |
| Code Suggestions | ❌ | ✅ Context-aware |
| Code Generation | ❌ | ✅ Natural language |
| Code Review | ❌ | ✅ Quality scoring |
| Auto-Fix | ❌ | ✅ One-click |
| AI Menu | ❌ | ✅ With shortcuts |

## 🔮 Future Enhancements

- [ ] Natural language code editing
- [ ] Voice-to-code conversion
- [ ] Pair programming AI assistant
- [ ] Code refactoring suggestions
- [ ] Smart debugging assistant
- [ ] Multi-language support
- [ ] Custom model training interface

## 📄 License

This project is open source and available for educational purposes.

---

Happy Coding! 🎨💻
