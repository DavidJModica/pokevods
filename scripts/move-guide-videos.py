#!/usr/bin/env python3
"""Move Guide Videos section to correct location in App.js"""

with open('src/App.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find Guide Videos section (lines 4460-4524, but 0-indexed so 4459-4523)
guide_videos_start = 4459  # Line 4460 in editor
guide_videos_end = 4524    # Line 4525 in editor (exclusive)

# Extract Guide Videos section
guide_videos_section = lines[guide_videos_start:guide_videos_end]

# Remove Guide Videos from wrong location
lines_before_guide_videos = lines[:guide_videos_start]
lines_after_guide_videos = lines[guide_videos_end:]

# Find insertion point (after line 3885, which is index 3884)
insertion_point = 3885

# Reconstruct file with Guide Videos in correct location
new_lines = (
    lines_before_guide_videos[:insertion_point] +
    ['\n'] +
    guide_videos_section +
    lines_before_guide_videos[insertion_point:] +
    lines_after_guide_videos
)

# Write back to file
with open('src/App.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ Successfully moved Guide Videos section to correct location")
print(f"   Moved from line {guide_videos_start + 1} to line {insertion_point + 1}")
