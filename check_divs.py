import re

def check_divs(filepath):
    print(f"--- {filepath} ---")
    with open(filepath, 'r') as f:
        content = f.read()

    # Split by `activeTab === '`
    parts = content.split("activeTab === '")
    for part in parts[1:]:
        tab_id = part.split("'")[0]
        # extract the block from `{activeTab === '...' && (` to the next `)}`
        # We need a small parser to find the matching `)}` that closes the block.
        # A simple way: find the next `          )}` at indentation 10 spaces.
        block_match = re.search(r"&& \((.*?)\n          \)}", part, flags=re.DOTALL)
        if block_match:
            block = block_match.group(1)
            # count `<div` and `</div`
            div_open = len(re.findall(r'<div\b[^>]*>', block))
            div_close = len(re.findall(r'</div\s*>', block))
            print(f"Tab '{tab_id}': +{div_open} -{div_close} = {div_open - div_close}")
        else:
            print(f"Tab '{tab_id}': Could not find block end")

check_divs('src/app/admin/seo/titles-meta/page.tsx')
check_divs('src/app/admin/seo/general/page.tsx')
