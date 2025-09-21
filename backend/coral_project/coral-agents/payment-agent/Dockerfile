# Use lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for caching layers)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent code
COPY . .

# Expose port (match what registry.toml says: 3000)
EXPOSE 3000

# Start the agent with Uvicorn
CMD ["uvicorn", "agent:app", "--host", "0.0.0.0", "--port", "3000"]

