#!/bin/bash

echo "Setting up Lifeline AI Python environment..."

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

echo ""
echo "Setup complete! To run the server:"
echo "  source venv/bin/activate"
echo "  python main.py"