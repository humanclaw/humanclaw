const API = '/api/v1';

export function renderTerminal(container: HTMLElement): void {
  container.innerHTML = `
    <div class="terminal-section">
      <h2>&gt; I/O Resolution Terminal</h2>

      <div class="form-group">
        <label for="trace-id">Trace ID</label>
        <input type="text" id="trace-id" placeholder="e.g. TK-9527" />
      </div>

      <div class="form-group">
        <label for="result-text">Delivery Payload (text)</label>
        <textarea id="result-text" placeholder="Paste the worker's deliverable, summary, or code here..."></textarea>
      </div>

      <div class="form-group">
        <label for="result-file">Attachment (optional)</label>
        <input type="file" id="result-file" />
      </div>

      <div class="btn-group">
        <button class="btn btn-primary" id="btn-submit">Submit &amp; Resume</button>
        <button class="btn btn-danger" id="btn-reject">Reject &amp; Retry</button>
      </div>
    </div>
  `;

  container.querySelector('#btn-submit')!.addEventListener('click', handleSubmit);
  container.querySelector('#btn-reject')!.addEventListener('click', handleReject);
}

async function handleSubmit(): Promise<void> {
  const traceId = (document.getElementById('trace-id') as HTMLInputElement).value.trim();
  const resultText = (document.getElementById('result-text') as HTMLTextAreaElement).value.trim();

  if (!traceId) {
    showToast('Trace ID is required', 'error');
    return;
  }

  if (!resultText) {
    showToast('Delivery payload is required', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/tasks/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trace_id: traceId,
        result_data: { text: resultText },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error ?? 'Failed to resume', 'error');
      return;
    }

    const msg = data.job_complete
      ? `Task resolved! Job complete - ready for OpenClaw sync.`
      : `Task ${traceId} resolved successfully.`;

    showToast(msg, 'success');
    clearForm();
  } catch {
    showToast('Network error', 'error');
  }
}

async function handleReject(): Promise<void> {
  const traceId = (document.getElementById('trace-id') as HTMLInputElement).value.trim();

  if (!traceId) {
    showToast('Trace ID is required', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/tasks/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trace_id: traceId }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error ?? 'Failed to reject', 'error');
      return;
    }

    showToast(`Task ${traceId} rejected and deadline extended.`, 'success');
    clearForm();
  } catch {
    showToast('Network error', 'error');
  }
}

function clearForm(): void {
  (document.getElementById('trace-id') as HTMLInputElement).value = '';
  (document.getElementById('result-text') as HTMLTextAreaElement).value = '';
}

function showToast(message: string, type: 'success' | 'error'): void {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
