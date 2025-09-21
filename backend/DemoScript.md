# GlobalMedTriage Emergency Demo Script

## Scenario: Multilingual Emergency Call

1. **Caller (Spanish):** "¡Ayuda! Mi padre tiene dolor en el pecho y no puede respirar."
2. **Voice Interface Agent:** Detects Spanish, panic tone, transcribes.
3. **Medical Triage Agent:** Analyzes symptoms, assigns ESI 1 (critical).
4. **Translation Agent:** Responds in Spanish: "Una ambulancia está en camino. ¿Hay historial de problemas cardíacos?"
5. **Medical Office Agent:** Collects brief history.
6. **Vital Signs Agent:** Analyzes stress/voice for vitals.
7. **Dispatch Agent:** Simulates ambulance dispatch to caller's GPS.
8. **Insurance Agent:** Verifies coverage/payment.
9. **Hospital Notification:** Simulated (log output).

---

## How to Run
- Use the frontend to record a voice message (Spanish, Chinese, etc.)
- Watch real-time agent responses in the UI
- All steps are orchestrated via backend WebSocket
