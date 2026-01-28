
import { GoogleGenAI, Type } from "@google/genai";
import { ApiService } from "./api";
import { Message, User, WorkItem, BotContent } from "../types";
import { BudgetService } from "./budgetService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class BotService {
  private static BOT_USER_ID = 'u-bot';

  static async processMention(message: Message, currentUser: User): Promise<void> {
    if (!message.content.toLowerCase().includes('@mavribot')) return;

    const processingMsg: Message = {
      id: `bot-${Date.now()}`,
      channelId: message.channelId,
      parentId: message.parentId,
      senderId: this.BOT_USER_ID,
      content: '⌛ MavriOps AI motoru verileri çapraz analiz ediyor, lütfen bekleyin...',
      timestamp: new Date().toISOString(),
      reactions: [],
      isBotMessage: true
    };
    
    await ApiService.sendMessage(processingMsg);

    try {
      // Fix: Used fetchMessages instead of non-existent fetchChannelHistory and applied slicing for history
      const messages = await ApiService.fetchMessages(message.channelId || 'c1');
      const history = messages.slice(-25);
      const allWorkItems = await ApiService.fetchWorkItems();
      const budgets = BudgetService.getBudgets();
      
      const command = message.content.replace(/@mavribot/gi, '').trim();
      const prompt = this.buildEnhancedPrompt(command, history, allWorkItems, budgets, currentUser);

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
                    status: { type: Type.STRING },
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

      const botResponseData: BotContent = JSON.parse(response.text || '{}');

      await ApiService.updateMessage(processingMsg.id, {
        content: `🤖 **MavriOps AI Analiz Raporu** (@${currentUser.name} için):`,
        botData: botResponseData
      });

    } catch (error) {
      console.error("Bot Error:", error);
      await ApiService.updateMessage(processingMsg.id, {
        content: '❌ Veri analizi sırasında bir hata oluştu. Lütfen komutunuzu daha net belirtin veya sistem yöneticisine başvurun.'
      });
    }
  }

  private static buildEnhancedPrompt(command: string, history: Message[], workItems: WorkItem[], budgets: any[], user: User): string {
    return `
      ROLÜN: MavriOps Kurumsal İş Zekası Botu. 
      HEDEF: Kullanıcının sorusunu sistem verileriyle (İş Kalemleri, Bütçeler, Mesajlar) yanıtlamak.
      
      KULLANICI: ${user.name} (Rol: ${user.role})
      KOMUT: "${command || 'genel durum özeti çıkar'}"
      
      SİSTEM VERİLERİ (CONTEXT):
      1. SOHBET: ${JSON.stringify(history.map(m => m.content))}
      2. İŞLER: ${JSON.stringify(workItems.map(w => ({ id: w.id, title: w.title, status: w.status, site: w.siteId })))}
      3. BÜTÇE: ${JSON.stringify(budgets.map(b => ({ id: b.scopeId, limit: b.amount, consumed: b.consumed })))}
      
      YÖNERGELER:
      - Sadece sistemdeki verileri kullan.
      - Bütçe aşımı riski varsa mutlaka 'criticalRisk' alanında belirt.
      - Dil profesyonel ve sonuç odaklı olmalı (Türkçe).
      - Raporu yapılandırılmış JSON formatında dön.
    `;
  }
}
