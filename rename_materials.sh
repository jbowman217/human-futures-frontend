#!/bin/bash
cd public/materials || exit 1

echo "🔁 Renaming short-code files to standard task filenames..."

# Black Holes
mv bht1.png blackhole-task1-1.png
mv bht1b.png blackhole-task2-1.png
mv bht1c.png blackhole-task3-1.png

# Spinning Toy
mv spintoy2.png spintoy-task1-1.png
mv spintoy2a.png spintoy-task2-1.png
mv spintoy3.png spintoy-task3-1.png

# Access to Healthcare
mv healthcaremt1.png access-to-healthcare-task1-1.png
mv healthcaremt2.png access-to-healthcare-task2-1.png
mv healthcaremt3.png access-to-healthcare-task3-1.png

# Green New Deal
mv greenht1.png greenhousing-task1-1.png
mv greenht2.png greenhousing-task2-1.png
mv ght3.png greenhousing-task3-1.png

# Mass Incarceration
mv mit1.png massincar-task1-1.png
mv mit2.png massincar-task2-1.png
mv mit3.png massincar-task3-1.png

# Probability
mv mpt1.png probability-task1-1.png
mv mpt2.png probability-task2-1.png
mv pst3.png probability-task3-1.png

# Calculus (updated)
mv atht1.png calculus-task1-1.png
mv atht2.png calculus-task2-1.png
mv atht3.png calculus-task3-1.png

# Safe Internet
mv sit1.png safe-internet-task1-1.png
mv sit2.png safe-internet-task2-1.png
mv sit3.png safe-internet-task3-1.png

echo "✅ All filenames renamed to match mvp_tasks.json"
