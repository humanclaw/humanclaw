const API = '/api/v1';

interface HumanTask {
  trace_id: string;
  job_id: string;
  assignee_id: string;
  todo_description: string;
  deadline: string;
  status: 'PENDING' | 'DISPATCHED' | 'RESOLVED' | 'OVERDUE';
  result_data: unknown;
}

interface JobWithTasks {
  job_id: string;
  original_prompt: string;
  tasks: HumanTask[];
}

interface ActiveJobsResponse {
  jobs: JobWithTasks[];
}

export async function fetchActiveJobs(): Promise<ActiveJobsResponse> {
  const res = await fetch(`${API}/jobs/active`);
  return res.json();
}

export function renderPipeline(
  container: HTMLElement,
  data: ActiveJobsResponse
): void {
  if (data.jobs.length === 0) {
    container.innerHTML = '<div class="empty">No active jobs. Create one via the API or CLI.</div>';
    return;
  }

  container.innerHTML = data.jobs
    .map(job => {
      const resolved = job.tasks.filter(t => t.status === 'RESOLVED').length;
      const total = job.tasks.length;
      const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;

      const dispatched = job.tasks.filter(
        t => t.status === 'DISPATCHED' || t.status === 'PENDING'
      );
      const overdue = job.tasks.filter(t => t.status === 'OVERDUE');
      const done = job.tasks.filter(t => t.status === 'RESOLVED');

      return `
        <div class="job-card">
          <div class="job-header">
            <span class="job-title">${escapeHtml(job.original_prompt)}</span>
            <span class="job-id">${job.job_id}</span>
          </div>
          <div class="progress-label">${resolved}/${total} completed (${pct}%)</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <div class="kanban">
            <div class="kanban-lane">
              <div class="lane-title dispatched">Dispatched (${dispatched.length})</div>
              ${dispatched.map(renderTaskCard).join('')}
            </div>
            <div class="kanban-lane">
              <div class="lane-title overdue">Overdue (${overdue.length})</div>
              ${overdue.map(renderTaskCard).join('')}
            </div>
            <div class="kanban-lane">
              <div class="lane-title resolved">Resolved (${done.length})</div>
              ${done.map(renderTaskCard).join('')}
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderTaskCard(task: HumanTask): string {
  const deadlineStr = new Date(task.deadline).toLocaleString();
  return `
    <div class="task-card">
      <div class="task-trace">${task.trace_id}</div>
      <div class="task-desc">${escapeHtml(task.todo_description)}</div>
      <div class="task-meta">Assignee: ${task.assignee_id} | Deadline: ${deadlineStr}</div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
