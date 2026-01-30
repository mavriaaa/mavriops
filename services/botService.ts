
import { GoogleGenAI, Type } from "@google/genai";
import { ApiService } from "./api";
import { Message, User, WorkItem, BotContent } from "../types";
import { BudgetService } from "./budgetService";

export class BotService {
  private static BOT_USER_ID = 'u-bot';

  static async processMention(message: Message, currentUser: User): Promise<void> {
    if (!message.content.toLowerCase().includes('@mavribot')) return;

    // Correctly initialize GoogleGenAI inside the method to use the latest API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const processingMsg: Message = {
      id: `bot-${Date.now()}`,
      channelId: message.channelId,
      parentId: message.parentId,
      senderId: this.BOT_USER_ID,
      content: '⌛ MavriOps Kurumsal Zeka Motoru analiz yapıyor...',
      timestamp: new Date().toISOString(),
      reactions: [],
      isBotMessage: true
    };
    
    await ApiService.sendMessage(processingMsg);

    try {
      const messages = await ApiService.fetchMessages(message.channelId || 'c1');
      const history = messages.slice(-15);
      const metrics = await ApiService.getMetricSummary();
      const allWorkItems = await ApiService.fetchWorkItems();
      
      const command = message.content.replace(/@mavribot/gi, '').trim();
      const prompt = this.buildEvidencePrompt(command, history, metrics, allWorkItems, currentUser);

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
                 }
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
                   }
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
                   }
                 }
               },
               missingInfo: { type: Type.ARRAY, items: { type: Type.STRING } }
             },
             required: ["summary", "workItems", "actions"]
          }
        }
      });

      // Corrected extraction of text output from GenerateContentResponse. Use .text property.
      const botData: BotContent = JSON.parse(response.text || '{}');

      await ApiService.updateMessage(processingMsg.id, {
        content: `🤖 **Sistem Veri Özeti** (@${currentUser.name} için):`,
        botData: botData
      });

    } catch (error) {
      console.error("Bot Error:", error);
      await ApiService.updateMessage(processingMsg.id, {
        content: '❌ Mevcut sistem verilerine ulaşılamadı. Lütfen teknik birimi bilgilendirin.'
      });
    }
  }

  private static buildEvidencePrompt(command: string, history: Message[], metrics: any, workItems: WorkItem[], user: User): string {
    return `
      ROLÜN: MavriOps Kurumsal Kanıt-Tabanlı Analiz Botu.
      GÖREV: Kullanıcının sorusuna SADECE sağlanan JSON verilerini kullanarak yanıt vermek.
      
      SİSTEM METRİKLERİ (SSOT): ${JSON.stringify(metrics)}
      AKTİF İŞLER: ${JSON.stringify(workItems.slice(0, 10).map(w => ({ id: w.id, title: w.title, status: w.status, priority: w.priority })))}
      KULLANICI: ${user.name} (${user.role})
      KOMUT: "${command || 'genel durum özeti çıkar'}"
      
      YÖNERGELER:
      1. Veri uydurma. Eğer veri yoksa "missingInfo" alanında belirt.
      2. Durum kısmında SSOT metriklerini referans ver (örn: "Şu an onay bekleyen 7 işlem var").
      3. Rapor dili profesyonel, sonuç odaklı ve Türkçedir.
      4. Kaynak kısmına mutlaka ilgili ID'yi yaz (örn: "Kaynak: R-7001").
    `;
  }
}
