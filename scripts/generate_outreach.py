import os
import argparse
import sys

# Try importing the new Google GenAI SDK or fallback
try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Please install the Google GenAI SDK: pip install google-genai")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Generate Cover Letter and LinkedIn DMs from CV and Job Description.")
    parser.add_argument("--cv", type=str, default="experience-bank.md", help="Path to your CV or Experience Bank markdown file.")
    parser.add_argument("--jd", type=str, required=True, help="Path to the Job Description text file.")
    parser.add_argument("--output", type=str, default="outreach_materials.md", help="Path to save the generated materials.")
    
    args = parser.parse_args()

    # Check if files exist
    if not os.path.exists(args.cv):
        print(f"Error: CV file '{args.cv}' not found.")
        print("Please create an 'experience-bank.md' file with your details.")
        sys.exit(1)
        
    if not os.path.exists(args.jd):
        print(f"Error: Job Description file '{args.jd}' not found.")
        sys.exit(1)

    # Read files
    with open(args.cv, 'r', encoding='utf-8') as f:
        cv_text = f.read()
        
    with open(args.jd, 'r', encoding='utf-8') as f:
        jd_text = f.read()

    # Get API Key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set.")
        sys.exit(1)

    print("Generating outreach materials...")
    
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are an expert career coach and technical recruiter. 
    I am applying for the job described below.
    
    Here is my CV / Experience Bank:
    {cv_text}
    
    Here is the Job Description:
    {jd_text}
    
    Please generate the following:
    
    1. **Highly Customized Cover Letter**: Keep it concise, engaging, and directly highlight my experience that maps to their requirements. Don't use generic corporate jargon.
    
    2. **LinkedIn DM Sequence**:
       - **Message 1 (Connection Request)**: Max 300 characters. A friendly hook mentioning the role and my relevant background.
       - **Message 2 (Follow-up after acceptance)**: A short, value-driven message proposing a quick chat or sharing a relevant project/achievement.
       
    Format the output beautifully in Markdown.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=prompt,
        )
        
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(response.text)
            
        print(f"Success! Generated materials saved to '{args.output}'")
        
    except Exception as e:
        print(f"An error occurred during generation: {e}")

if __name__ == "__main__":
    main()
