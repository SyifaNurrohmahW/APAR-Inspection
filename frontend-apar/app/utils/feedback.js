const FEEDBACK_EVENT = 'apar-feedback';

const emitFeedback = (detail) => {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent(FEEDBACK_EVENT, {
        detail: {
          ...detail,
          resolve
        }
      })
    );
  });
};

export const showFeedback = ({
  title = 'Informasi',
  message,
  type = 'info',
  confirmLabel = 'Mengerti'
}) => {
  return emitFeedback({
    title,
    message,
    type,
    confirmLabel,
    showCancel: false
  });
};

export const showConfirm = ({
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  type = 'warning'
}) => {
  return emitFeedback({
    title,
    message,
    type,
    confirmLabel,
    cancelLabel,
    showCancel: true
  });
};

export { FEEDBACK_EVENT };
