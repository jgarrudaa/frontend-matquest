const GameState = {
  defaults: { questionIndex: 0, lives: 3, score: 0, correct: 0, streak: 0, hintUsed: false, lastResult: null, lastExplanation: '', lastPoints: 0, lastAnsweredIndex: null, roundQuestions: [], roundTopic: null, roundId: null },
  normalize(value = {}) {
    const number = (candidate, fallback, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) => Number.isFinite(candidate) ? Math.min(maximum, Math.max(minimum, Math.trunc(candidate))) : fallback;
    return { ...this.defaults, questionIndex: number(value.questionIndex, 0), lives: number(value.lives, 3, 0, 3), score: number(value.score, 0), correct: number(value.correct, 0), streak: number(value.streak, 0), hintUsed: value.hintUsed === true, lastResult: ['acerto', 'erro'].includes(value.lastResult) ? value.lastResult : null, lastExplanation: typeof value.lastExplanation === 'string' ? value.lastExplanation : '', lastPoints: number(value.lastPoints, 0, 0, 100), lastAnsweredIndex: Number.isInteger(value.lastAnsweredIndex) && value.lastAnsweredIndex >= 0 ? value.lastAnsweredIndex : null, roundQuestions: Array.isArray(value.roundQuestions) ? value.roundQuestions : [], roundTopic: ['seno', 'cosseno', 'tangente', 'razoes'].includes(value.roundTopic) ? value.roundTopic : null, roundId: typeof value.roundId === 'string' ? value.roundId : null };
  },
  get() { try { return this.normalize(JSON.parse(localStorage.getItem('triquest_game') || '{}')); } catch { return this.normalize(); } },
  set(patch) { const value = this.normalize({ ...this.get(), ...patch }); localStorage.setItem('triquest_game', JSON.stringify(value)); return value; },
  reset() { const value = this.normalize(); localStorage.setItem('triquest_game', JSON.stringify(value)); return value; },
};
window.GameState = GameState;
function showToast(message) { const toast = document.querySelector('#toast'); if (!toast) return; toast.textContent = message; toast.hidden = false; clearTimeout(showToast.timer); showToast.timer = setTimeout(() => { toast.hidden = true; }, 3200); }
window.showToast = showToast;
async function hydrateUser() {
  try {
    if (!window.Api.token) return;
    const data = document.body.classList.contains('page-home') ? await window.Api.dashboard() : { user: await window.Api.me() };
    const name = data.user?.user_metadata?.display_name || localStorage.getItem('triquest_name') || 'Estudante';
    document.querySelectorAll('[data-user-name]').forEach((node) => { node.textContent = name; });
    const chip = document.querySelector('#user-chip'); if (chip) chip.textContent = name;
    if (data.progress) {
      document.querySelector('#stat-score').textContent = data.progress.score || 0;
      document.querySelector('#stat-correct').textContent = data.progress.total_correct || 0;
      document.querySelector('#stat-streak').textContent = data.progress.current_streak || 0;
      const mastery = window.TriQuestEngine.calculateMastery(data.questions, data.attempts);
      document.querySelectorAll('[data-topic-card]').forEach((card) => { const percent = mastery[card.dataset.topicCard] || 0; card.querySelector('.progress i').style.width = percent + '%'; card.querySelector('.mastery-label').textContent = percent + '% dominado'; });
    }
  } catch (error) { if (document.body.classList.contains('page-home')) showToast(error.message); }
}
document.addEventListener('DOMContentLoaded', () => {
  hydrateUser();
  document.querySelector('#logout-button')?.addEventListener('click', () => { window.Api.logout(); localStorage.removeItem('triquest_name'); location.href = 'index.html'; });
  document.querySelector('#mobile-profile')?.addEventListener('click', () => showToast('Seu progresso está salvo na sua conta.'));
});
