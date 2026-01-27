
import React, { useState } from 'react';
import { Paperclip, X, Download, File, Image, Check, Loader2 } from 'lucide-react';
import { Attachment } from '../../types';
import { ApiService } from '../../services/api';

interface Props {
  attachments: Attachment[];
  onUpload: (a: Attachment) => void;
  onRemove: (id: string) => void;
  isReadOnly?: boolean;
}

const AttachmentList: React.FC<Props> = ({ attachments, onUpload, onRemove, isReadOnly }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await ApiService.uploadFile(file, (p) => setProgress(p));
      onUpload(result);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 cursor-pointer transition-all group">
          <input type="file" className="hidden" onChange={handleFile} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <span className="text-[10px] font-black uppercase text-slate-400">Yükleniyor %{progress}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Paperclip size={18} className="text-slate-400 group-hover:text-indigo-500" />
              <span className="text-[10px] font-black uppercase text-slate-500">Belge veya Resim Ekle</span>
            </div>
          )}
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        {attachments.map((a) => (
          <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between group">
            <div className="flex items-center gap-3 min-w-0">
              {a.type.startsWith('image') ? <Image size={16} className="text-blue-500" /> : <File size={16} className="text-slate-400" />}
              <div className="min-w-0">
                <p className="text-[10px] font-bold dark:text-white truncate uppercase">{a.name}</p>
                <p className="text-[8px] text-slate-400">{(a.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 hover:text-indigo-500 transition-colors"><Download size={14} /></button>
              {!isReadOnly && <button onClick={() => onRemove(a.id)} className="p-1.5 hover:text-rose-500 transition-colors"><X size={14} /></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentList;
