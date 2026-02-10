
import { GoogleGenAI, Type } from "@google/genai";
import { ApiService } from "./api";
import { Message, User, WorkItem, BotContent } from "../types";

export class BotService {
  private static BOT_USER_ID = 'u-bot';

  static async processMention(message: Message, currentUser: User): Promise<void> {
    if (!message.content.toLowerCase().includes('@mavribot')) return;

    // Fix: Use named parameter for apiKey as required by SDK guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const processingMsg: Message = {
      id: `bot-${Date.now()}`,
      channelId: message.channelId,
      parentId: message.parentId,
      senderId: this.BOT_USER_ID,
      content: '⌛ Ops Asistan: Mevcut bağlam ve sistem verileri analiz ediliyor...',
      timestamp: new Date().toISOString(),
      reactions: [],
      isBotMessage: true
    };
    
    await ApiService.sendMessage(processingMsg);

    try {
      const metrics = await ApiService.getMetricSummary();
      const allWorkItems = await ApiService.fetchWorkItems();
      const auditLogs = await ApiService.getAuditLogs();
      
      const command = message.content.replace(/@mavribot/gi, '').trim();
      const prompt = this.buildEvidencePrompt(command, metrics, allWorkItems, auditLogs, currentUser);

      // Fix: Upgrade to gemini-3-pro-preview for better reasoning on operational data analysis
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               summary: {
                 type: Type.OBJECT,
                 properties: {
                   overall: { type: Type.STRING, description: "Ne oluyor? (Kısa durum tespiti)" },
                   criticalRisk: { type: Type.STRING, description: "Neden önemli? (Kritik etki)" },
                   pendingApprovals: { type: Type.STRING },
                   overdueTasks: { type: Type.STRING },
                   nextStep: { type: Type.STRING, description: "Ne yapılmalı? (Aksiyon önerisi)" }
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

      // Fix: Directly access .text property from GenerateContentResponse as per guidelines
      const botData: BotContent = JSON.parse(response.text || '{}');

      await ApiService.updateMessage(processingMsg.id, {
        content: `🤖 **Ops Asistan Karar Destek Raporu** (@${currentUser.name} için):`,
        botData: botData
      });

    } catch (error) {
      console.error("Ops Assistant Error:", error);
      await ApiService.updateMessage(processingMsg.id, {
        content: '❌ Operasyonel veri analiz motoru şu an yanıt vermiyor. Lütfen teknik birimi bilgilendirin.'
      });
    }
  }

  private static buildEvidencePrompt(command: string, metrics: any, workItems: WorkItem[], auditLogs: any[], user: User): string {
    return `
      ROLÜN: MavriOps Kurleşik “Ops Asistan”ısın.
      KİMLİK: Dijital Operasyon ve Karar Destek Yöneticisi.
      DAVRANIŞ: Profesyonel, net ve aksiyon odaklı. Asla varsayımda bulunma.
      
      SİSTEM METRİKLERİ: ${JSON.stringify(metrics)}
      AKTİF İŞLER (Örneklem): ${JSON.stringify(workItems.slice(0, 10).map(w => ({ id: w.id, title: w.title, status: w.status, priority: w.priority })))}
      SON AKTİVİTELER: ${JSON.stringify(auditLogs.slice(0, 5))}
      
      KULLANICI: ${user.name} (Rol: ${user.role})
      KOMUT: "${command || 'genel durum özeti çıkar'}"
      
      YÖNERGELER:
      1. Sadece sağlanan SSOT (Single Source of Truth) verilerini kullan.
      2. Asla kullanıcı adına onay/red işlemi "yaptım" deme. Sadece öneri sun.
      3. Yanıt yapısı: Ne oluyor? Neden önemli? Ne yapılmalı?
      4. Profesyonel ve mesafeli bir ton kullan.
    `;
  }
}
