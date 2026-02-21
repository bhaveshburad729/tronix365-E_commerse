import subprocess

def get_git_status():
    try:
        # Get modified tracked files
        result = subprocess.run(['git', 'diff', '--name-only'], capture_output=True, text=True, check=True)
        modified_files = [f for f in result.stdout.split('\n') if f.strip()]
        
        # Get untracked files
        result2 = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], capture_output=True, text=True, check=True)
        untracked_files = [f for f in result2.stdout.split('\n') if f.strip()]
        
        print("---MODIFIED---")
        for f in modified_files:
            print(f)
            
        print("---UNTRACKED---")
        for f in untracked_files:
            print(f)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_git_status()
