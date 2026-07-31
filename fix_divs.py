import re

files = [
    'src/app/admin/seo/titles-meta/page.tsx',
    'src/app/admin/seo/general/page.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # The issue is that there's an extra `</div>` right before `)}` for tabs where we stripped the outer `space-y-x` wrapper.
    # The structure looks like:
    #               </div>
    #             </div>
    #           )}
    # We just want to remove the LAST `</div>` before `)}` that matches this indentation (12 spaces).
    
    # Let's replace the exact string pattern:
    target_pattern = "              </div>\n            </div>\n          )}"
    replacement = "              </div>\n          )}"
    content = content.replace(target_pattern, replacement)

    target_pattern_2 = "                </div>\n              </div>\n            </div>\n          )}"
    replacement_2 = "                </div>\n              </div>\n          )}"
    content = content.replace(target_pattern_2, replacement_2)
    
    # Just in case there are 2 divs instead of 3
    target_pattern_3 = "            </div>\n            </div>\n          )}"
    replacement_3 = "            </div>\n          )}"
    content = content.replace(target_pattern_3, replacement_3)

    target_pattern_4 = "              </div>\n            </div>\n            </div>\n          )}"
    replacement_4 = "              </div>\n            </div>\n          )}"
    content = content.replace(target_pattern_4, replacement_4)

    # Let's just use regex to remove exactly one </div> that comes immediately before )}
    content = re.sub(r'</div>(\s*)}\)', r'\1)}\)', content)

    with open(filepath, 'w') as f:
        f.write(content)
