# main.py
from fastapi import FastAPI, UploadFile
import numpy as np
import librosa
import torch
import torch.nn as nn

app = FastAPI(title="Vital Signs Monitor API")

# Simple stress classifier neural net
class StressNet(nn.Module):
    def __init__(self, input_dim=20, hidden_dim=16, output_dim=3):
        super(StressNet, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        self.softmax = nn.Softmax(dim=1)
    
    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)
        out = self.softmax(out)
        return out

# Initialize model with random weights (MVP)
model = StressNet()
model.eval()

# Map output index to stress levels
stress_map = {0: "low", 1: "medium", 2: "high"}

@app.post("/analyze")
async def analyze(file: UploadFile):
    # Read audio bytes
    audio_bytes = await file.read()
    
    # Convert bytes to numpy array using librosa
    y, sr = librosa.load(librosa.io.BytesIO(audio_bytes), sr=16000)
    
    # Extract MFCC features
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    feature_vector = np.mean(mfccs.T, axis=0)
    
    # Convert to torch tensor
    input_tensor = torch.tensor(feature_vector, dtype=torch.float32).unsqueeze(0)
    
    # Predict stress
    with torch.no_grad():
        output = model(input_tensor)
        stress_idx = torch.argmax(output, dim=1).item()
        stress_level = stress_map[stress_idx]
    
    # Mock heart rate (optional: could improve later)
    heart_rate = 70
    
    return {"stress_level": stress_level, "heart_rate": heart_rate}
