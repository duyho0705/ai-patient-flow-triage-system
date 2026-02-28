# System Architecture

Kiáº¿n trÃºc tá»•ng quan cá»§a **Há»‡ thá»‘ng Luá»“ng bá»‡nh nhÃ¢n & PhÃ¢n loáº¡i Æ°u tiÃªn** (AI-powered Patient Flow and Triage) cho phÃ²ng khÃ¡m táº¡i Viá»‡t Nam.

---

## TÃ i liá»‡u liÃªn quan

- **ERD:** [erd-cdm-platform-triage-vi.md](./erd-cdm-platform-triage-vi.md) (tiáº¿ng Viá»‡t), [erd-cdm-platform-triage.md](./erd-cdm-platform-triage.md) (tiáº¿ng Anh)
- **API:** [api-endpoints.md](./api-endpoints.md)
- **Role & chá»©c nÄƒng:** [roles-and-features.md](./roles-and-features.md)
- **Roadmap:** [roadmap-tiep-theo.md](./roadmap-tiep-theo.md)

---

## SÆ¡ Ä‘á»“ component (cao cáº¥p)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     REST (JSON)      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Web UI        â”‚ â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º â”‚   Backend API   â”‚
â”‚   (React/Vite)  â”‚   X-Tenant-Id       â”‚   (Spring Boot) â”‚
â”‚                 â”‚   X-Branch-Id       â”‚                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                  â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚                             â”‚                             â”‚
                    â–¼                             â–¼                             â–¼
            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”             â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”             â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚  PostgreSQL  â”‚             â”‚ AI Triage     â”‚             â”‚ (Identity /   â”‚
            â”‚  (DB)        â”‚             â”‚ Provider      â”‚             â”‚  Auth â€“ plan)  â”‚
            â”‚  tenant,      â”‚             â”‚ (rule-based   â”‚             â”‚               â”‚
            â”‚  patient,     â”‚             â”‚  or pluggable)â”‚             â”‚               â”‚
            â”‚  triage,      â”‚             â”‚               â”‚             â”‚               â”‚
            â”‚  queue,       â”‚             â”‚ ai_triage_    â”‚             â”‚               â”‚
            â”‚  ai_triage_  â”‚             â”‚ audit         â”‚             â”‚               â”‚
            â”‚  audit        â”‚             â”‚               â”‚             â”‚               â”‚
            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜             â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜             â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- **Web UI:** Äa tenant (tenant + chi nhÃ¡nh tá»« header). Role: Admin, Receptionist, Triage Nurse, Doctor, Clinic Manager.
- **Backend:** Modular monolith. Má»i API (trá»« Tenant) yÃªu cáº§u `X-Tenant-Id`; `X-Branch-Id` tÃ¹y chá»n.
- **DB:** Má»™t schema PostgreSQL; tenant_id / branch_id trÃªn cÃ¡c báº£ng nghiá»‡p vá»¥.
- **AI Triage:** Provider interface; rule-based hiá»‡n táº¡i; má»—i láº§n gá»i AI ghi `ai_triage_audit` (Explainability).
- **Auth:** Dá»± kiáº¿n JWT; role trong token; phÃ¢n quyá»n theo role. Xem roadmap.

---

## Luá»“ng nghiá»‡p vá»¥ chÃ­nh

1. **Tiáº¿p nháº­n** (Receptionist): TÃ¬m/táº¡o bá»‡nh nhÃ¢n (CCCD/SÄT), Ä‘áº·t lá»‹ch, check-in, walk-in.
2. **PhÃ¢n loáº¡i** (Triage Nurse): Táº¡o phiÃªn phÃ¢n loáº¡i â€” lÃ½ do khÃ¡m, sinh hiá»‡u; AI gá»£i Ã½ acuity (1â€“5); cháº¥p nháº­n hoáº·c override (ghi lÃ½ do); Ä‘Æ°a vÃ o hÃ ng chá» theo Æ°u tiÃªn.
3. **HÃ ng chá»:** Sáº¯p xáº¿p theo acuity (1 trÆ°á»›c 5) rá»“i thá»i gian vÃ o hÃ ng; bÃ¡c sÄ© xem danh sÃ¡ch, gá»i sá»‘.
4. **KhÃ¡m** (Doctor): Xem há»“ sÆ¡ (lÃ½ do, sinh hiá»‡u, káº¿t quáº£ AI triage), ghi cháº©n Ä‘oÃ¡n/chá»‰ Ä‘á»‹nh, káº¿t thÃºc lÆ°á»£t.
5. **Admin / AI Audit:** Quáº£n lÃ½ tenant, user, role; xem lá»‹ch sá»­ AI (Ä‘á» xuáº¥t vs quyáº¿t Ä‘á»‹nh thá»±c táº¿) â€” **Explainability**.

---

## Module backend (modular monolith)

| Module       | MÃ´ táº£ ngáº¯n |
|-------------|------------|
| **tenant**  | PhÃ²ng khÃ¡m, chi nhÃ¡nh. |
| **identity**| User, role (dÃ¹ng cho phÃ¢n quyá»n; Auth JWT dá»± kiáº¿n). |
| **patient** | Bá»‡nh nhÃ¢n, báº£o hiá»ƒm. |
| **scheduling** | Lá»‹ch háº¹n, khung giá». |
| **triage**  | PhiÃªn phÃ¢n loáº¡i, lÃ½ do khÃ¡m, sinh hiá»‡u; AI gá»£i Ã½ acuity; override reason. |
| **queue**   | Äá»‹nh nghÄ©a hÃ ng chá», báº£n ghi hÃ ng chá»; sort theo acuity. |
| **clinical**| KhÃ¡m, cháº©n Ä‘oÃ¡n (má»Ÿ rá»™ng sau). |
| **aiaudit** | AiModelVersion, AiTriageAudit; API list audit (suggested vs actual). |

---

## Enterprise / CV highlights

- **AI Audit + Explainability:** Má»—i láº§n gá»i AI ghi `ai_triage_audit`; API so sÃ¡nh suggested acuity vs actual acuity (quyáº¿t Ä‘á»‹nh con ngÆ°á»i).
- **Override reason:** Khi y tÃ¡ khÃ´ng cháº¥p nháº­n gá»£i Ã½ AI, ghi `override_reason` trong phiÃªn phÃ¢n loáº¡i.
- **HÃ ng chá» theo Æ°u tiÃªn:** Danh sÃ¡ch chá» sort theo acuity (1 trÆ°á»›c 5) rá»“i thá»i gian vÃ o hÃ ng; DTO cÃ³ `acuityLevel` Ä‘á»ƒ hiá»ƒn thá»‹.
- **Äa tenant:** Tenant + chi nhÃ¡nh; má»i dá»¯ liá»‡u scoped theo tenant.
- **Role-based:** Admin, Receptionist, Triage Nurse, Doctor, Clinic Manager; phÃ¢n quyá»n tháº­t (Auth JWT) lÃ  bÆ°á»›c tiáº¿p theo.
