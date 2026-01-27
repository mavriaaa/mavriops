
import { GoogleGenAI, Type } from "@google/genai";
import { ApiService } from "./api";
import { Message, User, WorkItem, BotContent } from "../types";

// Always use process.env.API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class BotService {
  private static BOT_USER_ID = 'u-bot';

  static async processMention(message: Message, currentUser: User): Promise<void> {
    if (!message.content.toLowerCase().includes('@mavribot')) return;

    // 1. "İşleme alındı" ön yanıtı
    const processingMsg: Message = {
      id: `bot-${Date.now()}`,
      channelId: message.channelId,
      parentId: message.parentId,
      senderId: this.BOT_USER_ID,
      content: '⌛ Talebiniz MavriOps AI motoru tarafından işleme alındı, veriler analiz ediliyor...',
      timestamp: new Date().toISOString(),
      reactions: [],
      isBotMessage: true
    };
    
    await ApiService.sendMessage(processingMsg);

    try {
      // 2. Bağlamı Topla
      const history = await ApiService.fetchChannelHistory(message.channelId || 'c1', 20);
      const workItems = await ApiService.fetchWorkItemsBySite('site-a'); // Örn: Mevcut kanalın sahası

      // 3. Prompt Hazırla
      const command = message.content.replace(/@mavribot/gi, '').trim();
      const prompt = this.buildPrompt(command, history, workItems, currentUser);

      // 4. Gemini Analizi
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.OBJECT,
                properties: {
                  overall: { type: Type.STRING },
                  criticalRisk: { type: Type.STRING },
                  pendingApprovals: { type: Type.STRING },
                  overdueTasks: { type: Type.STRING },
                  nextStep: { type: Type.STRING }
                },
                required: ["overall", "criticalRisk", "pendingApprovals", "overdueTasks", "nextStep"]
              },
              workItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    type: { type: Type.STRING },
                    status: { type: Type.STRING },
                    assignee: { type: Type.STRING },
                    dueDate: { type: Type.STRING },
                    source: { type: Type.STRING }
                  },
                  required: ["id", "title", "status", "source"]
                }
              },
              actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    assignee: { type: Type.STRING },
                    dueDate: { type: Type.STRING },
                    source: { type: Type.STRING }
                  },
                  required: ["task", "source"]
                }
              },
              missingInfo: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["summary", "workItems", "actions"]
          }
        }
      });

      // result.text is a property, not a method.
      const botResponseData: BotContent = JSON.parse(response.text || '{}');

      // 5. Yanıtı Güncelle
      await ApiService.updateMessage(processingMsg.id, {
        content: `🤖 @${currentUser.name} için hazırlanan MavriOps Durum Raporu:`,
        botData: botResponseData
      });

    } catch (error) {
      console.error("Bot Error:", error);
      await ApiService.updateMessage(processingMsg.id, {
        content: '❌ Özür dilerim, verileri analiz ederken bir teknik sorun oluştu veya yetki sınırlarına takıldım. Lütfen daha sonra tekrar deneyin.'
      });
    }
  }

  private static buildPrompt(command: string, history: Message[], workItems: WorkItem[], user: User): string {
    return `
      SENİN ROLÜN: MavriOps Enterprise AI Bot (MavriBot).
      HEDEF: Kullanıcının isteğine göre kurumsal iş akışı verilerini analiz et ve yapılandırılmış özet çıkar.
      
      KULLANICI: ${user.name} (Rol: ${user.role})
      KOMUT: "${command || 'özet'}"
      
      VERİ KAYNAKLARI:
      1. SOHBET GEÇMİŞİ (Son 20 mesaj):
      ${JSON.stringify(history.map(m => ({ user: m.senderId, text: m.content, time: m.timestamp })))}
      
      2. İŞ KALEMLERİ (Erişilebilir Veri):
      ${JSON.stringify(workItems.map(w => ({ id: w.id, title: w.title, status: w.status, priority: w.priority, type: w.type, site: w.siteId })))}
      
      KURALLAR:
      1. ASLA UYDURMA. Bilgi yoksa "BULAMADIM" de.
      2. HER MADDEYE KAYNAK EKLE (Örn: "Kaynak: WI-1001" veya "Kaynak: MSG-88").
      3. DİL: Profesyonel işletme dili, Türkçe.
      4. KISA VE NET OL.
      5. GİZLİLİK: Maaş veya özel kişisel verileri asla sızdırma.
      
      İSTENEN FORMAT (JSON):
      summary: { overall, criticalRisk, pendingApprovals, overdueTasks, nextStep }
      workItems: Array<{ id, title, type, status, assignee, dueDate, source }>
      actions: Array<{ task, assignee, dueDate, source }>
      missingInfo: Array<string>
    `;
  }
}
