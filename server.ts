import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { InstitutionInputs, LeadCaptureData, CalculationResults, SavedLeadRecord } from './src/types';

const app = express();
app.use(express.json());

const PORT = 3000;

// Persistent In-Memory Database for Leads
let leadsDatabase: SavedLeadRecord[] = [
  // Pre-seed a beautiful default record for visual presentation in the Sales CRM simulator
  {
    id: "lead_seed_91a0",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    lead: {
      firstName: "Marta",
      lastName: "Rodríguez",
      email: "m.rodriguez@unam.mx",
      institution: "Universidad Nacional Autónoma de México",
      jobTitle: "Rectora de Innovación",
      country: "MX",
      phone: "+52 55 5622 1200",
      consentGdpr: true,
      consentLgpd: false
    },
    inputs: {
      country: "MX",
      students: 22000,
      faculty: 1200,
      dropoutRate: 11.5,
      annualTuition: 4200,
      digitalInvestment: 350000,
      resourceUtilization: 35,
      weeklySearchHours: 4,
      facultyHourlyCost: 28,
      activeStudentsPct: 58,
      inactiveStudentCost: 550,
      odiloInvestment: 130000
    },
    results: {
      costs: {
        dropout: 10626000,
        resource: 227500,
        knowledge: 537600,
        engagement: 5082000,
        total: 16473100
      },
      scenarios: {
        conservative: {
          name: "conservative",
          dropoutReduction: 3,
          resourceImprovement: 20,
          knowledgeImprovement: 20,
          engagementImprovement: 15,
          dropoutBenefit: 318780,
          resourceBenefit: 45500,
          knowledgeBenefit: 107520,
          engagementBenefit: 762300,
          totalBenefit: 1234100,
          roi: 849.3,
          paybackMonths: 1.26
        },
        expected: {
          name: "expected",
          dropoutReduction: 5,
          resourceImprovement: 35,
          knowledgeImprovement: 35,
          engagementImprovement: 25,
          dropoutBenefit: 531300,
          resourceBenefit: 79625,
          knowledgeBenefit: 188160,
          engagementBenefit: 1270500,
          totalBenefit: 2069585,
          roi: 1492,
          paybackMonths: 0.75
        },
        optimistic: {
          name: "optimistic",
          dropoutReduction: 8,
          resourceImprovement: 50,
          knowledgeImprovement: 50,
          engagementImprovement: 40,
          dropoutBenefit: 850080,
          resourceBenefit: 113750,
          knowledgeBenefit: 268800,
          engagementBenefit: 2032800,
          totalBenefit: 3265430,
          roi: 2411.8,
          paybackMonths: 0.47
        },
        custom: {
          name: "custom",
          dropoutReduction: 5.5,
          resourceImprovement: 35,
          knowledgeImprovement: 35,
          engagementImprovement: 27,
          dropoutBenefit: 584430,
          resourceBenefit: 79625,
          knowledgeBenefit: 188160,
          engagementBenefit: 1372140,
          totalBenefit: 2224355,
          roi: 1611,
          paybackMonths: 0.7
        }
      }
    },
    scenario: "expected"
  }
];

// Lazy Gemini API Client Initializer
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// 1. Leads Database Endpoints
app.post('/api/leads', (req, res) => {
  const { lead, inputs, results, scenario } = req.body;
  if (!lead || !inputs || !results) {
    return res.status(400).json({ error: 'Missing lead, inputs, or results' });
  }
  const newRecord: SavedLeadRecord = {
    id: `lead_${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toISOString(),
    lead,
    inputs,
    results,
    scenario: scenario || 'expected'
  };
  leadsDatabase.push(newRecord);
  res.status(201).json(newRecord);
});

app.get('/api/leads', (req, res) => {
  res.json(leadsDatabase);
});

app.delete('/api/leads', (req, res) => {
  leadsDatabase = [];
  res.json({ status: 'ok', message: 'Leads history cleared' });
});

// 2. AI Executive Recommendations Endpoint
app.post('/api/generate-insights', async (req, res) => {
  const { inputs, lead, lang, results } = req.body as {
    inputs: InstitutionInputs;
    lead: LeadCaptureData;
    lang: string;
    results: CalculationResults;
  };

  const client = getAiClient();
  const languageName = lang === 'pt' ? 'Portuguese' : lang === 'es' ? 'Spanish' : 'English';

  if (!client) {
    // Elegant fallback in case GEMINI_API_KEY is not set or configured
    const defaultSummary = lang === 'pt'
      ? `Com base na análise, a instituição enfrenta vazamentos operacionais de ${results.costs.total.toLocaleString()} anuais. A implementação da ODILO oferece retorno expressivo.`
      : lang === 'es'
      ? `Basado en el análisis, la institución enfrenta pérdidas operativas de ${results.costs.total.toLocaleString()} anuales. La implementación de ODILO ofrece un retorno de inversión sobresaliente.`
      : `Based on our analysis, the institution faces annual operational leakage of ${results.costs.total.toLocaleString()}. Implementing ODILO offers an outstanding return on investment.`;

    const defaultRecs = lang === 'pt'
      ? [
          "Otimizar as taxas de evasão integrando conteúdo e trilhas de aprendizagem personalizadas da ODILO.",
          "Otimizar as licenças digitais eliminando redundâncias e licenças subutilizadas.",
          "Reduzir o tempo de preparação docente em 35% com curadoria pré-selecionada.",
          "Engajar estudantes inativos por meio de clubes de leitura dinâmicos e gamificação."
        ]
      : lang === 'es'
      ? [
          "Reducir la deserción escolar implementando planes de lectura personalizados y tutorías integradas.",
          "Eliminar licencias digitales subutilizadas consolidando recursos de aprendizaje en ODILO.",
          "Ahorrar 4 horas semanales de preparación docente mediante curaduría inteligente.",
          "Fomentar la participación activa de los alumnos utilizando clubs de aprendizaje digital gamificados."
        ]
      : [
          "Reduce attrition using custom student learning paths and personalized onboarding materials.",
          "Consolidate underutilized library licenses into ODILO's flat-rate digital ecosystem.",
          "Save up to 4 hours of prep weekly for instructors with dynamic content matchmaking.",
          "Drive active engagement via interactive learning clubs and built-in notifications."
        ];

    return res.json({
      summary: defaultSummary,
      recommendations: defaultRecs
    });
  }

  try {
    const prompt = `You are a world-class McKinsey executive advisor.
Review this higher education institution's financial parameters:
- University: ${lead.institution} (located in ${lead.country})
- Enrollment size: ${inputs.students} students, ${inputs.faculty} faculty
- Current dropout rate: ${inputs.dropoutRate}% (Tuition: ${inputs.annualTuition} annually)
- Annual licensing budget for digital collections: ${inputs.digitalInvestment}
- Resource utilization rate: ${inputs.resourceUtilization}%
- Faculty content search overhead: ${inputs.weeklySearchHours} hours weekly per teacher
- Annual total financial leak: ${results.costs.total}

Please write an executive advisor brief tailored specifically in the language: ${languageName}.
Ensure:
1. 'summary': A high-level executive brief (3-4 sentences maximum). It must address their specific country context or university size, quantify the leak, and mention the significant ROI expected with ODILO's flat-rate unlimited learning playground. Keep it professional, objective, and clear. Do not use asterisks or formatting.
2. 'recommendations': A list of exactly 4 concise, actionable recommendations (one for each key challenge: student dropout, digital license waste, faculty search overhead, and student disengagement). Each recommendation must be action-oriented and under 20 words.

Return ONLY the valid JSON structure.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['summary', 'recommendations']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error calling Gemini on server:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
});

// 3. Vite Server / Production Assets serving
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ODILO ROI Calculator running at http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
