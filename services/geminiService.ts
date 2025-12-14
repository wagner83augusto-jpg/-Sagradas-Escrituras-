import { GoogleGenAI, Type } from "@google/genai";
import { ChapterData, SearchResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VERSION_NAMES: Record<string, string> = {
  'ACF': 'Almeida Corrigida Fiel',
  'ARA': 'Almeida Revista e Atualizada',
  'NVI': 'Nova Versão Internacional',
  'NTLH': 'Nova Tradução na Linguagem de Hoje'
};

export const fetchChapterContent = async (book: string, chapter: number, version: string = 'ACF'): Promise<ChapterData> => {
  const model = "gemini-2.5-flash";
  const versionName = VERSION_NAMES[version] || 'Almeida Corrigida Fiel';
  
  const prompt = `Gere o texto bíblico completo para o livro de ${book}, capítulo ${chapter} na versão ${versionName} (português).
  Retorne APENAS um JSON válido.
  Não inclua markdown formatting (\`\`\`json).`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            book: { type: Type.STRING },
            chapter: { type: Type.NUMBER },
            verses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  verse: { type: Type.NUMBER },
                  text: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    
    return JSON.parse(text) as ChapterData;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
};

export const fetchApocryphaContent = async (book: string, chapter: number): Promise<ChapterData> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `Gere o texto completo do livro apócrifo (deuterocanônico/pseudepígrafo) de ${book}, capítulo ${chapter} em português (tradução clássica ou comum para estudos históricos).
  Retorne APENAS um JSON válido.
  Se o capítulo não existir, retorne vazio.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            book: { type: Type.STRING },
            chapter: { type: Type.NUMBER },
            verses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  verse: { type: Type.NUMBER },
                  text: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    
    return JSON.parse(text) as ChapterData;
  } catch (error) {
    console.error("Error fetching apocrypha chapter:", error);
    throw error;
  }
};

export const searchBible = async (query: string, version: string = 'ACF'): Promise<SearchResult[]> => {
  const model = "gemini-2.5-flash";
  const versionName = VERSION_NAMES[version] || 'Almeida Corrigida Fiel';
  
  const prompt = `Atue como uma concordância bíblica avançada. Encontre versículos bíblicos relevantes para a busca: "${query}".
  Use a versão ${versionName} (português).
  Retorne os 10-15 resultados mais relevantes em JSON.
  Para cada resultado, inclua o nome exato do livro, capítulo, versículo e o texto.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              book: { type: Type.STRING },
              chapter: { type: Type.NUMBER },
              verse: { type: Type.NUMBER },
              text: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as SearchResult[];
  } catch (error) {
    console.error("Error searching bible:", error);
    return [];
  }
};

export const fetchDictionaryDefinition = async (term: string): Promise<string> => {
  const model = "gemini-2.5-flash";
  // Prompt ajustado para teologia Adventista
  const prompt = `Você é um dicionário bíblico especializado na teologia Adventista do Sétimo Dia. Forneça uma definição para: "${term}".
  
  Diretrizes:
  1. Baseie a explicação na Bíblia Sagrada.
  2. Incorpore a visão teológica das 28 Crenças Fundamentais da IASD quando aplicável (ex: estado dos mortos, santuário celestial, sábado, mortalidade da alma).
  3. Você pode mencionar insights de Ellen G. White ou do Comentário Bíblico Adventista (SDABC) para enriquecer a resposta, identificando-os claramente.
  4. Mantenha a resposta concisa (máximo de 3 parágrafos) e use formatação Markdown suave (negrito).`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Não foi possível encontrar uma definição no momento.";
  } catch (error) {
    console.error("Error definition:", error);
    return "Erro ao conectar com o servidor de conhecimento bíblico.";
  }
};

export interface DailyReflection {
  reference: string;
  text: string;
  reflection: string;
  theme?: string;
}

export const fetchDailyReflection = async (theme?: string): Promise<DailyReflection> => {
  const model = "gemini-2.5-flash";
  
  const themePrompt = theme 
    ? `sobre o tema "${theme}". A reflexão deve ser uma mensagem motivacional e espiritual focada em ajudar alguém passando por isso ou buscando isso` 
    : "inspirador aleatório com foco em esperança e fé";

  const prompt = `Selecione um versículo bíblico ${themePrompt} na versão Almeida (ARA de preferência).
  Escreva uma reflexão devocional curta (3-4 frases) alinhada à fé Adventista do Sétimo Dia.
  Se o tema for algo como "Ansiedade" ou "Tristeza", seja acolhedor e consolador. Se for "Motivação", seja encorajador.
  Retorne em JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reference: { type: Type.STRING, description: "Ex: Apocalipse 14:6" },
            text: { type: Type.STRING, description: "O texto do versículo" },
            reflection: { type: Type.STRING, description: "Reflexão devocional adventista curta e motivacional" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    
    return JSON.parse(text) as DailyReflection;
  } catch (error) {
    console.error("Error fetching daily reflection:", error);
    return {
      reference: "Filipenses 4:13",
      text: "Posso todas as coisas naquele que me fortalece.",
      reflection: "Não importa o tamanho do desafio que você enfrenta hoje, lembre-se que sua força não vem de si mesmo, mas de Cristo. Ele capacita os cansados e dá vigor aos que não têm nenhum poder. Confie Nele."
    };
  }
};

export const askBibleAssistant = async (question: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  const model = "gemini-2.5-flash";
  const systemInstruction = `Você é um assistente bíblico Adventista do Sétimo Dia experiente e amigável.
  
  Diretrizes Fundamentais:
  1. **Bíblia como Regra de Fé:** Sua base primária é a Bíblia Sagrada (Sola Scriptura).
  2. **Harmonia com Crenças IASD:** Suas respostas devem estar em harmonia com as 28 Crenças Fundamentais.
  3. **Conciso:** Responda de forma direta, mas completa.`;

  try {
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
      },
      history: history
    });

    const result = await chat.sendMessage({ message: question });
    return result.text || "Desculpe, não consegui gerar uma resposta.";
  } catch (error) {
    console.error("Error asking assistant:", error);
    return "Desculpe, estou tendo dificuldades para processar sua pergunta no momento.";
  }
};

// --- CURSOS TEOLÓGICOS ---

export interface CourseModule {
  id: number;
  title: string;
  description: string;
}

export interface CourseContent {
  title: string;
  content: string; // Markdown
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  reference?: string; // Added field for Bible Reference
}

export const fetchCourseSyllabus = async (topic: string): Promise<CourseModule[]> => {
    const model = "gemini-2.5-flash";
    const prompt = `Crie um currículo sistemático de 5 módulos para um curso bíblico adventista sobre: "${topic}".
    Retorne apenas JSON.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchCourseContent = async (topic: string, moduleTitle: string): Promise<CourseContent> => {
    const model = "gemini-2.5-flash";
    const prompt = `Escreva o conteúdo educacional completo para o módulo "${moduleTitle}" do curso sobre "${topic}".
    Seja profundo, teológico e sistemático. Use Markdown para formatar (negrito, listas).`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error(e);
        return { title: moduleTitle, content: "Erro ao carregar conteúdo." };
    }
};

export const fetchCourseQuiz = async (content: string): Promise<QuizQuestion[]> => {
    const model = "gemini-2.5-flash";
    const prompt = `Com base no seguinte conteúdo, crie 3 perguntas de múltipla escolha difíceis para testar o aluno.
    Conteúdo: ${content.substring(0, 3000)}...
    Retorne JSON.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctOptionIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        return [];
    }
};

// --- QUIZ BÍBLICO (GAME) ---

export const fetchBibleQuizQuestion = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<QuizQuestion> => {
    const model = "gemini-2.5-flash";
    const prompt = `Gere uma pergunta de Quiz Bíblico de dificuldade ${difficulty}.
    Foque em fatos, doutrinas, profecias ou histórias bíblicas.
    Retorne JSON. Inclua o campo "reference" com o livro/capítulo onde a resposta se encontra.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } }, // Deve ter 4 opções
                        correctOptionIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING },
                        reference: { type: Type.STRING, description: "Ex: Gênesis 6:14" }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error(e);
        return {
            question: "Quem foi engolido por um grande peixe?",
            options: ["Jonas", "Pedro", "Paulo", "Noé"],
            correctOptionIndex: 0,
            explanation: "Jonas foi engolido por um grande peixe preparado por Deus.",
            reference: "Jonas 1:17"
        };
    }
};