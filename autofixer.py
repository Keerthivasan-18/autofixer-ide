import requests
import javalang
from z3 import *

# -------------------------------
# AST PARSER
# -------------------------------
def parse_ast(java_code):
    try:
        tree = javalang.parse.parse(java_code)
        return tree
    except Exception as e:
        return None


# -------------------------------
# CFG (SIMPLIFIED)
# -------------------------------
def build_cfg(java_code):
    lines = java_code.split("\n")
    cfg = []

    for i, line in enumerate(lines):
        cfg.append({
            "line": i + 1,
            "code": line.strip()
        })

    return cfg


# -------------------------------
# INFINITE LOOP DETECTION
# -------------------------------
def detect_infinite_loops(java_code):
    warnings = []

    if "while(true)" in java_code or "for(;;)" in java_code:
        warnings.append("Potential infinite loop detected")

    return warnings


# -------------------------------
# Z3 SYMBOLIC CHECK (BASIC)
# -------------------------------
def z3_analysis():
    x = Int('x')
    solver = Solver()

    # Example constraint (can expand later)
    solver.add(x > 0)

    if solver.check() == sat:
        return "Z3: Constraints satisfied"
    else:
        return "Z3: Unsatisfiable constraints"


# -------------------------------
# NEURO-SYMBOLIC FIXER (LLM + ANALYSIS)
# -------------------------------
def neuro_symbolic_fix(java_code, analysis_report):
    url = "http://localhost:11434/api/generate"

    prompt = f"""
You are a STRICT Java Code Fixer.

Your ONLY task is to FIX the given Java code.
You are NOT allowed to rewrite, redesign, or replace the program.

================ HARD CONSTRAINTS (DO NOT VIOLATE) =================
1. You MUST preserve the original structure of the code.
2. You MUST keep the SAME class name(s) from the input.
3. You MUST NOT create new unrelated programs.
4. You MUST NOT change the purpose of the program.
5. You MUST NOT generate example programs like BankAccount or demos.
6. You MUST NOT output explanations, comments, or extra text.
7. You MUST ONLY modify lines that contain errors.
8. If a line is correct, DO NOT change it.
9. If input has one class, output must have one class.
10. If you violate ANY rule, your answer is WRONG.

================ ANALYSIS =================
{analysis_report}

================ INPUT JAVA CODE =================
java_code = f""
// ORIGINAL CODE START
{java_code}
// ORIGINAL CODE END
""

================ REQUIRED OUTPUT =================
Return ONLY the corrected version of THE SAME code.
Do NOT replace it with a new program.
"""

    data = {
        "model": "phi",
        "prompt": prompt,
        "stream": False,
        "temperature": 0.0
    }

    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        return response.json().get("response", "").strip()
    except Exception as e:
        return f"LLM Error: {e}"


# -------------------------------
# MAIN PIPELINE
# -------------------------------
def fix_java_code(java_code):
    report = []

    # AST
    ast = parse_ast(java_code)
    report.append(f"AST Parsed: {bool(ast)}")

    # CFG
    cfg = build_cfg(java_code)
    report.append(f"CFG Nodes: {len(cfg)}")

    # Infinite Loop
    loops = detect_infinite_loops(java_code)
    if loops:
        report.extend(loops)

    # Z3
    z3_result = z3_analysis()
    report.append(z3_result)

    analysis_report = "\n".join(report)

    # Final Neuro-Symbolic Fix
    fixed_code = neuro_symbolic_fix(java_code, analysis_report)
    fixed_code = clean_output(fixed_code)

    return fixed_code

def clean_output(output):
    # Remove garbage like explanations
    if "A:" in output:
        output = output.split("A:")[0]

    if "Explanation" in output:
        output = output.split("Explanation")[0]

    return output.strip()

# -------------------------------
# TEST
# -------------------------------
if __name__ == "__main__":
    buggy_code = """
    public class Demo {
        public static void main(String[] args) {
            int a = "10"
            int b = 20
            while(true){
                System.out.println(a + b)
            }
        }
    }
    """

    result = fix_java_code(buggy_code)
    print("\nFixed Code:\n")
    print(result)
