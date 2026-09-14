'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldAlert,
  X
} from 'lucide-react';

import { FEEDBACK_EVENT } from '@/utils/feedback';

const typeConfig = {
  success: {
    icon: CheckCircle,
    iconClass: 'bg-[#e7f8ef] text-[#00a862]',
    buttonClass: 'bg-[#00a862] hover:bg-[#008f55]'
  },
  error: {
    icon: ShieldAlert,
    iconClass: 'bg-[#fee9e6] text-[#e95345]',
    buttonClass: 'bg-[#e95345] hover:bg-[#d9473a]'
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'bg-[#fff3d8] text-[#d58a00]',
    buttonClass: 'bg-[#e95345] hover:bg-[#d9473a]'
  },
  info: {
    icon: Info,
    iconClass: 'bg-[#eeecff] text-[#7a6ff0]',
    buttonClass: 'bg-[#e95345] hover:bg-[#d9473a]'
  }
};

export default function FeedbackHost() {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const handleFeedback = (event) => {
      setDialog(event.detail);
    };

    window.addEventListener(FEEDBACK_EVENT, handleFeedback);

    return () => {
      window.removeEventListener(FEEDBACK_EVENT, handleFeedback);
    };
  }, []);

  if (!dialog) {
    return null;
  }

  const config = typeConfig[dialog.type] || typeConfig.info;
  const Icon = config.icon;

  const closeDialog = (value) => {
    dialog.resolve?.(value);
    setDialog(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f1b1a]/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md animate-fade-in rounded-[24px] border border-[#eadfdb] bg-white shadow-[0_24px_70px_rgba(31,27,26,0.22)]">
        <div className="flex items-start gap-4 px-6 py-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.iconClass}`}
          >
            <Icon size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#1f1b1a]">
                  {dialog.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6f625f]">
                  {dialog.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => closeDialog(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#9b8d89] transition hover:bg-[#fee9e6] hover:text-[#e95345]"
                aria-label="Tutup pesan"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#eadfdb] px-6 py-4">
          {dialog.showCancel && (
            <button
              type="button"
              onClick={() => closeDialog(false)}
              className="rounded-xl border border-[#eadfdb] bg-white px-5 py-2.5 text-sm font-bold text-[#6f625f] transition hover:border-[#e95345] hover:bg-[#fffaf8] hover:text-[#e95345]"
            >
              {dialog.cancelLabel}
            </button>
          )}

          <button
            type="button"
            onClick={() => closeDialog(true)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_18px_rgba(233,83,69,0.22)] transition hover:-translate-y-0.5 ${config.buttonClass}`}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
