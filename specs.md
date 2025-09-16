# Binary Brain - Projektspezifikation

## Projektübersicht

**Binary Brain** ist eine web-basierte Lernapp für True/False-Quiz, die Studenten dabei hilft, effektiv für Klausuren zu lernen. Die Anwendung ermöglicht das Hochladen von Fragendateien (CSV/Excel), interaktives Beantworten der Fragen mit visueller Rückmeldung, Fortschrittsverfolgung und KI-gestützte Erklärungen.

---

## Tech Stack

### Frontend Framework
- **Vue 3** mit Composition API
- **Vite** als Build Tool und Dev Server
- **TypeScript** für Type Safety

### State Management & Styling
- **Pinia** für globales State Management
- **Tailwind CSS** für modernes, responsives Design
- **Headless UI** für accessible UI-Komponenten

### Datenverarbeitung & APIs
- **SheetJS (xlsx)** für Excel/CSV Import
- **OpenAI SDK** für KI-Erklärungen
- **Axios** für HTTP-Requests

### Development Tools
- **ESLint** + **Prettier** für Code Quality
- **Vitest** für Unit Testing
- **.env** für Umgebungsvariablen

---

## Funktionale Anforderungen

### 1. Datei-Import System

#### 1.1 Unterstützte Dateiformate
- **CSV-Dateien** (.csv)
- **Excel-Dateien** (.xlsx, .xls)

#### 1.2 Dateistruktur
**Zwei-Spalten-Format:**
- **Spalte 1:** Fragentext
- **Spalte 2:** Korrekte Antwort

**Unterstützte Antwortformate:**
- `true` / `false`
- `1` / `0`
- `ja` / `nein`
- `richtig` / `falsch`
- `TRUE` / `FALSE` (case insensitive)

#### 1.3 Import-Funktionalität
- Drag & Drop Upload-Bereich
- File Browser mit Dateiselektion
- Automatische Erkennung des Antwortformats
- Validierung der Dateistruktur
- Fehlermeldungen bei ungültigen Dateien
- Nur eine Datei gleichzeitig laden

### 2. Quiz-Interface

#### 2.1 Fragendarstellung
- **Anzeige:** Fragen in ursprünglicher Reihenfolge der Datei
- **Layout:** Zentralisierte Fragenansicht
- **Typografie:** Große, gut lesbare Schrift
- **Responsives Design:** Mobile-first Ansatz

#### 2.2 Antwort-Interface
- **Buttons:** "Ja" und "Nein" Buttons
- **Keyboard Navigation:**
    - Pfeiltasten links/rechts für Ja/Nein
    - Pfeiltasten hoch/runter für vorherige/nächste Frage
    - Enter zum Bestätigen
    - Space für nächste Frage

#### 2.3 Navigation
- **Vorwärts/Rückwärts:** Zwischen allen Fragen navigieren
- **Fragenindikator:** "Frage X von Y"
- **Fortschrittsbalken:** Visueller Fortschritt
- **Reset-Button:** Quiz-Durchlauf zurücksetzen

#### 2.4 Feedback-System
- **Sofortiges Feedback:** Grün für richtig, Rot für falsch
- **Animationen:** Smooth Transitions und Micro-Interactions
- **Sound-Effekte:** Optional für richtige/falsche Antworten

### 3. OpenAI Integration

#### 3.1 API-Konfiguration
- **API Key Management:** Über .env Datei
- **Environment Variables:**
  ```
  VITE_OPENAI_API_KEY=sk-...
  VITE_OPENAI_MODEL=gpt-3.5-turbo
  ```

#### 3.2 Erklärungsfunktion
- **Trigger:** "Erklärung anfordern" Button nach Antwort
- **Prompt-Template:**
  ```
  Erkläre, warum die folgende Aussage [RICHTIG/FALSCH] ist:
  
  Frage: [QUESTION_TEXT]
  Korrekte Antwort: [CORRECT_ANSWER]
  
  Bitte gib eine ausführliche, verständliche Erklärung auf Deutsch.
  ```
- **Loading State:** Spinner während API-Request
- **Error Handling:** Fallback bei API-Fehlern

### 4. State Management (Pinia)

#### 4.1 Quiz Store
```typescript
interface QuizState {
  questions: Question[]
  currentQuestionIndex: number
  answers: UserAnswer[]
  isQuizActive: boolean
  isQuizCompleted: boolean
  statistics: QuizStatistics
}

interface Question {
  id: string
  text: string
  correctAnswer: boolean
  explanation?: string
}

interface UserAnswer {
  questionId: string
  userAnswer: boolean
  isCorrect: boolean
  timestamp: Date
}

interface QuizStatistics {
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  accuracy: number
  timeSpent: number
}
```

#### 4.2 Settings Store
```typescript
interface SettingsState {
  openaiApiKey: string
  soundEnabled: boolean
  theme: 'light' | 'dark'
  keyboardNavigation: boolean
}
```

### 5. Statistik & Auswertung

#### 5.1 Live-Statistik
- **Während des Quiz:**
    - Aktuelle Punktzahl
    - Richtige vs. Falsche Antworten
    - Fortschritt in Prozent

#### 5.2 End-Statistik
- **Nach Quiz-Abschluss:**
    - Gesamtergebnis (X von Y richtig)
    - Prozentualer Score
    - Detailansicht pro Frage
    - Zeit-Tracking
    - Möglichkeit zum Neustart

#### 5.3 Visualisierung
- **Charts:** Donut Chart für Ergebnisverteilung
- **Progress Bars:** Für Accuracy Rate
- **Color Coding:** Grün/Rot für Erfolg/Verbesserung

---

## UI/UX Design-Anforderungen

### Design-Philosophie
- **Modern:** Clean, zeitgemäßes Interface
- **Minimal:** Fokus auf Wesentliches, keine Ablenkungen
- **Gamifiziert:** Belohnende Micro-Interactions

### Color Palette
```css
/* Primary Colors */
--primary: #3B82F6    /* Blue */
--success: #10B981    /* Green */
--error: #EF4444      /* Red */
--warning: #F59E0B    /* Amber */

/* Neutral Colors */
--gray-50: #F9FAFB
--gray-900: #111827

/* Semantic Colors */
--correct: #059669    /* Green-600 */
--incorrect: #DC2626  /* Red-600 */
```

### Typography
- **Primary Font:** Inter (Google Fonts)
- **Font Weights:** 400, 500, 600, 700
- **Question Text:** Large (24px+), Semi-bold
- **UI Text:** Medium (16px), Regular

### Components Design

#### Upload Area
- Dashed border mit Hover-Effekt
- Drag & Drop Visual Feedback
- File Icon und beschreibender Text

#### Quiz Interface
- **Card-based Layout:** Elevated cards mit Schatten
- **Button Design:** Rounded, mit Hover-States
- **Animations:** 300ms ease-out transitions

#### Statistics Dashboard
- **Grid Layout:** Responsive Card-Grid
- **Data Visualization:** Chart.js Integration
- **Progress Indicators:** Animated progress bars

---

## Technische Architektur

### Projektstruktur
```
binary-brain/
├── public/
│   ├── favicon.ico
│   └── sounds/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── quiz/
│   │   ├── upload/
│   │   └── statistics/
│   ├── composables/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── views/
│   └── main.ts
├── .env.example
├── .env.local
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### Routing Structure
```typescript
const routes = [
  { path: '/', component: HomeView },           // Landing/Upload
  { path: '/quiz', component: QuizView },       // Quiz Interface
  { path: '/statistics', component: StatsView },// Results
  { path: '/settings', component: SettingsView }
]
```

### Data Flow
1. **File Upload** → Parse → Validate → Store in Pinia
2. **Quiz Start** → Initialize State → Navigate to Quiz
3. **Answer Question** → Update State → Visual Feedback
4. **Request Explanation** → OpenAI API → Display Response
5. **Quiz Complete** → Calculate Stats → Show Results

---

## API Integration

### OpenAI Configuration
```typescript
// utils/openai.ts
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function getExplanation(
  question: string, 
  correctAnswer: boolean
): Promise<string> {
  const prompt = `Erkläre, warum die folgende Aussage ${correctAnswer ? 'RICHTIG' : 'FALSCH'} ist:

Frage: ${question}
Korrekte Antwort: ${correctAnswer ? 'Richtig' : 'Falsch'}

Bitte gib eine ausführliche, verständliche Erklärung auf Deutsch.`

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.7
  })

  return response.choices[0]?.message?.content || 'Erklärung nicht verfügbar'
}
```

---

## Non-funktionale Anforderungen

### Performance
- **Ladezeit:** < 2 Sekunden initial load
- **File Processing:** < 1 Sekunde für 1000 Fragen
- **API Response:** < 3 Sekunden für Erklärungen

### Accessibility
- **Keyboard Navigation:** Vollständige Tastatur-Unterstützung
- **Screen Readers:** Semantic HTML + ARIA Labels
- **Color Contrast:** WCAG AA Compliance
- **Focus Management:** Sichtbare Focus States

### Browser Support
- **Modern Browsers:** Chrome 90+, Firefox 88+, Safari 14+
- **Mobile:** iOS Safari, Chrome Mobile
- **Progressive Enhancement:** Graceful degradation

### Security
- **API Key:** Nur Client-side, keine Server-Speicherung
- **Input Validation:** Sanitization aller User Inputs
- **File Upload:** Größen- und Typ-Beschränkungen

---

## Testing Strategy

### Unit Tests (Vitest)
- **Stores:** Pinia Store Actions/Getters
- **Utils:** File parsing, data validation
- **Composables:** Business Logic

### Integration Tests
- **File Upload:** CSV/Excel parsing
- **Quiz Flow:** Complete user journey
- **OpenAI Integration:** API calls (mocked)

### E2E Tests (Playwright)
- **Happy Path:** Upload → Quiz → Statistics
- **Error Handling:** Invalid files, API failures
- **Accessibility:** Keyboard navigation

---

## Deployment & Environment

### Development Setup
```bash
npm create vue@latest binary-brain
cd binary-brain
npm install

# Additional dependencies
npm install pinia tailwindcss openai xlsx axios
npm install -D @types/node vitest
```

### Environment Variables
```env
# .env.local
VITE_OPENAI_API_KEY=sk-your-api-key-here
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_APP_NAME=Binary Brain
VITE_MAX_FILE_SIZE=10485760
```

### Build & Deployment
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Deployment:** Static hosting (Netlify/Vercel)

---

## Projektphasen & Milestones

### Phase 1: Core Setup (Week 1)
- [ ] Projekt-Setup mit Vue 3 + Vite
- [ ] Pinia Store Implementation
- [ ] Basic UI Components (Upload, Quiz)
- [ ] CSV/Excel Parsing

### Phase 2: Quiz Logic (Week 2)
- [ ] Quiz State Management
- [ ] Question Navigation
- [ ] Answer Validation
- [ ] Visual Feedback System

### Phase 3: OpenAI Integration (Week 3)
- [ ] API Key Configuration
- [ ] Explanation Service
- [ ] Error Handling
- [ ] Loading States

### Phase 4: Statistics & Polish (Week 4)
- [ ] Statistics Dashboard
- [ ] Data Visualization
- [ ] Responsive Design
- [ ] Accessibility Improvements

### Phase 5: Testing & Deployment
- [ ] Unit Tests
- [ ] E2E Tests
- [ ] Performance Optimization
- [ ] Deployment Setup

---

## Future Enhancements (Optional)

### Version 2.0 Features
- **Multi-Choice Questions:** Erweiterte Fragetypen
- **Timer Mode:** Zeitbasierte Challenges
- **Progress Tracking:** Langzeit-Statistiken
- **Spaced Repetition:** Intelligente Wiederholung
- **Social Features:** Teilen von Quiz-Sets
- **Offline Mode:** PWA Funktionalität

### Advanced Analytics
- **Learning Curves:** Fortschritt über Zeit
- **Difficulty Analysis:** Schwierigkeits-Erkennung
- **Recommendation Engine:** Personalisierte Lerntipps

---

## Erfolgskriterien

### Funktional
- ✅ CSV/Excel Import funktioniert fehlerfrei
- ✅ Alle Frageformate werden erkannt
- ✅ Quiz-Navigation ist intuitiv
- ✅ OpenAI Erklärungen sind hilfreich
- ✅ Statistiken sind aussagekräftig

### Technisch
- ✅ < 2s Ladezeit
- ✅ Mobile responsive
- ✅ Keyboard accessible
- ✅ Fehlerbehandlung robust
- ✅ Code ist wartbar und erweiterbar

### User Experience
- ✅ Interface ist selbsterklärend
- ✅ Feedback ist sofort sichtbar
- ✅ Design ist ansprechend
- ✅ Performance ist flüssig
- ✅ App macht Spaß beim Lernen

---

## Ressourcen & Links

### Dokumentation
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

### Design Resources
- [Headless UI Components](https://headlessui.com/)
- [Hero Icons](https://heroicons.com/)
- [Tailwind UI](https://tailwindui.com/)

### Tools
- [SheetJS Documentation](https://docs.sheetjs.com/)
- [Chart.js](https://www.chartjs.org/)
- [Vitest Testing](https://vitest.dev/)

---

## Kontakt & Support

Diese Spezifikation dient als vollständige Grundlage für die Entwicklung der Binary Brain App mit Claude Code. Bei Fragen oder Änderungswünschen kann die Spezifikation iterativ angepasst werden.

**Viel Erfolg beim Lernen mit Binary Brain! 🧠✨**