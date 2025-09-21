-- Seed data for extended GlobalMedTriage schema

-- Basic roles
INSERT INTO roles (name, description) VALUES
 ('admin','System administrator'),
 ('clinician','Clinical staff user'),
 ('dispatcher','Emergency dispatch operator'),
 ('agent','Automated agent service account')
ON CONFLICT (name) DO NOTHING;

-- Demo users (password hashes are placeholders; replace with real hashed values)
INSERT INTO users (username, hashed_password, email, full_name) VALUES
 ('admin','bcrypt$2a$12$REPLACE_THIS_HASH','admin@example.com','Admin User'),
 ('nurse_anna','bcrypt$2a$12$REPLACE_THIS_HASH','anna@example.com','Anna Nurse'),
 ('dispatcher_dan','bcrypt$2a$12$REPLACE_THIS_HASH','dan@example.com','Dan Dispatcher')
ON CONFLICT (username) DO NOTHING;

-- Map users to roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON (
    (u.username='admin' AND r.name='admin') OR
    (u.username='nurse_anna' AND r.name='clinician') OR
    (u.username='dispatcher_dan' AND r.name='dispatcher')
) ON CONFLICT DO NOTHING;

-- Patients
INSERT INTO patients (external_id, first_name, last_name, date_of_birth, sex, phone, email, language_preference) VALUES
 ('P001','John','Doe','1980-05-14','male','+15550000001','john.doe@example.com','en'),
 ('P002','Maria','Gonzalez','1992-11-02','female','+15550000002','maria.g@example.com','es'),
 ('P003','Li','Wei','1975-03-22','other','+15550000003','li.wei@example.com','zh')
ON CONFLICT (external_id) DO NOTHING;

-- Encounters
INSERT INTO encounters (patient_id, chief_complaint, triage_priority, notes)
SELECT p.id, 'Chest pain', 2, 'Intermittent chest discomfort.' FROM patients p WHERE p.external_id='P001'
UNION ALL
SELECT p.id, 'Headache and dizziness', 3, 'Mild to moderate severity.' FROM patients p WHERE p.external_id='P002'
UNION ALL
SELECT p.id, 'Shortness of breath', 1, 'Acute onset.' FROM patients p WHERE p.external_id='P003';

-- Protocols
INSERT INTO protocols (name, description, steps) VALUES
 ('Chest Pain','Protocol for chest pain triage', '["Assess pain level", "Check for shortness of breath", "Monitor vitals", "Assign ESI"]'),
 ('Stroke','Protocol for suspected stroke', '["Check FAST symptoms", "Record time of onset", "Monitor vitals", "Assign ESI"]'),
 ('Trauma','Protocol for trauma cases', '["Assess consciousness", "Control bleeding", "Monitor vitals", "Assign ESI"]')
ON CONFLICT (name) DO NOTHING;

-- Protocol versions (version 1 for each)
INSERT INTO protocol_versions (protocol_id, version, steps)
SELECT id, 1, steps FROM protocols
ON CONFLICT (protocol_id, version) DO NOTHING;

-- Insurance providers
INSERT INTO insurance_providers (name, contact_phone, contact_email, metadata) VALUES
 ('HealthPlus','+18005550101','support@healthplus.example', '{"network":"A"}'),
 ('MediLife','+18005550102','info@medilife.example', '{"network":"B"}')
ON CONFLICT (name) DO NOTHING;

-- Insurance policies
INSERT INTO insurance_policies (patient_id, provider_id, policy_number, group_number, coverage_json, effective_date, expiration_date)
SELECT p.id, pr.id, 'HP-1001', 'GRP-ALPHA', '{"copay":25,"coverage":"standard"}', CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE + INTERVAL '265 days'
FROM patients p JOIN insurance_providers pr ON p.external_id='P001' AND pr.name='HealthPlus'
UNION ALL
SELECT p.id, pr.id, 'ML-2002', 'GRP-BETA', '{"copay":15,"coverage":"premium"}', CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE + INTERVAL '315 days'
FROM patients p JOIN insurance_providers pr ON p.external_id='P002' AND pr.name='MediLife';

-- Verifications
INSERT INTO insurance_verifications (policy_id, status, notes, raw_response)
SELECT id, 'verified', 'Automated initial verification', '{"ref":"VER123"}' FROM insurance_policies;

-- Sample triage logs
INSERT INTO triage_logs (user_id, encounter_id, patient_id, language, symptoms, esi_level, agent_responses)
SELECT (SELECT id FROM users WHERE username='nurse_anna'), e.id, e.patient_id, 'en', 'Chest pain radiating to left arm', 2, '{"ai_summary":"Potential cardiac issue"}'
FROM encounters e JOIN patients p ON e.patient_id = p.id WHERE p.external_id='P001'
UNION ALL
SELECT (SELECT id FROM users WHERE username='nurse_anna'), e.id, e.patient_id, 'es', 'Dolor de cabeza y mareos', 3, '{"ai_summary":"Monitor neurological signs"}'
FROM encounters e JOIN patients p ON e.patient_id = p.id WHERE p.external_id='P002';

-- Vital signs
INSERT INTO vital_signs (encounter_id, heart_rate, systolic_bp, diastolic_bp, respiratory_rate, spo2, temperature_c, stress_level)
SELECT id, 88, 130, 82, 18, 97, 37.0, 'moderate' FROM encounters ORDER BY id LIMIT 1;

-- Emergency dispatch request for severe encounter
INSERT INTO emergency_dispatch_requests (encounter_id, status, location_text, priority, details)
SELECT e.id, 'pending', '123 Main St, Springfield', 1, '{"reason":"Acute shortness of breath"}'
FROM encounters e JOIN patients p ON e.patient_id = p.id WHERE p.external_id='P003' LIMIT 1;

-- Translation log sample
INSERT INTO translations (source_language, target_language, source_text, translated_text, model)
VALUES ('en','es','Chest pain radiating to left arm','Dolor en el pecho que se irradia al brazo izquierdo','demo-model');

-- Audit events
INSERT INTO audit_log (user_id, event_type, entity_type, entity_id, event_data)
SELECT u.id, 'login', 'user', u.id, '{"ip":"127.0.0.1"}' FROM users u WHERE username='admin'
UNION ALL
SELECT (SELECT id FROM users WHERE username='nurse_anna'), 'triage_completed', 'encounter', e.id, '{"esi_level":2}' FROM encounters e ORDER BY e.id LIMIT 1;
