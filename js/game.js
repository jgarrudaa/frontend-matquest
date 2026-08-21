document.addEventListener('DOMContentLoaded', async () => {
  const engine = window.TriQuestEngine;
  const params = new URLSearchParams(location.search);
  let state = window.GameState.get();
  const topicParam = ['seno', 'cosseno', 'tangente', 'razoes'].includes(params.get('topic')) ? params.get('topic') : null;
  const requestedTopic = params.has('topic') || params.get('new') === '1' ? topicParam : state.roundTopic;
  let allQuestions;
  try { allQuestions = (await window.Api.questions(requestedTopic)).filter(isValidQuestion); }
  catch (error) { showRoundError(error.message); return; }

  const mustCreate = params.get('new') === '1' || state.roundQuestions.length !== engine.ROUND_SIZE || state.roundTopic !== requestedTopic;
  if (mustCreate) {
    try {
      const round = engine.createRound(allQuestions, requestedTopic);
      state = window.GameState.reset();
      state = window.GameState.set({ roundQuestions: round, roundTopic: requestedTopic, roundId: crypto.randomUUID?.() || String(Date.now()) });
    } catch (error) { showRoundError(error.message); return; }
  }
  if (state.questionIndex >= engine.ROUND_SIZE) { goToResult(state.score >= engine.WIN_SCORE ? 'vencedor' : 'perdedor'); return; }
  const questions = state.roundQuestions;
  const index = Math.min(state.questionIndex, engine.ROUND_SIZE - 1);
  const question = questions[index];
  let selected = null; let submitting = false;
  const startedAt = Date.now();
  renderRoundTitle(state.roundTopic); renderMap(questions, index); renderQuestion(question, index, state);
  const hintButton = document.querySelector('#hint-button'); const answerButton = document.querySelector('#answer-button');
  const revealHint = () => { document.querySelector('#hint-text').textContent = question.hint; document.querySelector('#hint-box').hidden = false; hintButton.disabled = true; };
  if (state.hintUsed) revealHint();
  hintButton.addEventListener('click', () => { revealHint(); window.GameState.set({ hintUsed: true }); });
  answerButton.addEventListener('click', async () => {
    if (selected === null || submitting) return;
    submitting = true; answerButton.disabled = true; hintButton.disabled = true;
    document.querySelectorAll('.option').forEach((option) => { option.disabled = true; });
    const current = window.GameState.get(); const correct = selected === Number(question.correct_answer);
    const elapsed = Math.round((Date.now() - startedAt) / 1000); const points = engine.calculatePoints({ correct, hintUsed: current.hintUsed });
    const next = window.GameState.set({ questionIndex: correct ? current.questionIndex + 1 : current.questionIndex, score: current.score + points, correct: current.correct + (correct ? 1 : 0), streak: correct ? current.streak + 1 : 0, lives: correct ? current.lives : current.lives - 1, lastResult: correct ? 'acerto' : 'erro', lastExplanation: question.explanation, lastPoints: points, lastAnsweredIndex: current.questionIndex, hintUsed: correct ? false : current.hintUsed });
    try { if (window.Api.token) await window.Api.saveAttempt({ question_id: question.id, selected_answer: selected, is_correct: correct, points_earned: points, response_time_seconds: elapsed }); }
    catch { window.showToast('Resposta avaliada, mas o progresso não foi sincronizado.'); }
    goToResult(next.lives <= 0 ? 'sem-vidas' : correct ? 'acerto' : 'erro');
  });
  function renderQuestion(item, currentIndex, currentState) {
    document.querySelector('#question-card').classList.remove('skeleton'); document.querySelector('#question-topic').textContent = topicLabel(item.topic); document.querySelector('#question-text').textContent = item.prompt;
    document.querySelector('#question-counter').textContent = `Desafio ${currentIndex + 1} de ${engine.ROUND_SIZE}`; document.querySelector('#quiz-progress').style.width = `${((currentIndex + 1) / engine.ROUND_SIZE) * 100}%`; document.querySelector('#lives').innerHTML = `${'♥ '.repeat(currentState.lives)}${'♡ '.repeat(engine.MAX_LIVES - currentState.lives)}<b>${currentState.lives}/${engine.MAX_LIVES}</b>`;
    const container = document.querySelector('#options'); container.innerHTML = '';
    item.options.forEach((option, optionIndex) => {
      const button = document.createElement('button'); button.className = 'option'; button.type = 'button'; button.setAttribute('role', 'radio'); button.setAttribute('aria-checked', 'false');
      const letter = document.createElement('b'); letter.textContent = ['A', 'B', 'C', 'D'][optionIndex]; const label = document.createElement('span'); label.textContent = String(option); button.append(letter, label, document.createElement('i'));
      button.addEventListener('click', () => { selected = optionIndex; container.querySelectorAll('.option').forEach((node) => { node.classList.remove('selected'); node.setAttribute('aria-checked', 'false'); }); button.classList.add('selected'); button.setAttribute('aria-checked', 'true'); answerButton.disabled = false; }); container.appendChild(button);
    });
  }
});
function topicLabel(topic) { return ({ seno: 'Seno', cosseno: 'Cosseno', tangente: 'Tangente', razoes: 'Razões no triângulo' })[topic] || topic; }
function renderRoundTitle(topic) { document.querySelector('#round-title').textContent = topic ? `Prática de ${topicLabel(topic)}` : 'Desafio misto'; }
function renderMap(questions, current) { const map = document.querySelector('#question-map'); map.innerHTML = ''; questions.forEach((question, index) => { const item = document.createElement('li'); item.className = index < current ? 'done' : index === current ? 'current' : ''; const marker = document.createElement('span'); marker.textContent = index < current ? '✓' : String(index + 1); const label = document.createElement('b'); label.textContent = topicLabel(question.topic); item.append(marker, label); map.appendChild(item); }); document.querySelector('#map-progress').style.height = `${(current / 9) * 100}%`; }
function isValidQuestion(q) { return Boolean(q && q.id != null && ['seno', 'cosseno', 'tangente', 'razoes'].includes(q.topic) && typeof q.prompt === 'string' && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(Number(q.correct_answer)) && typeof q.hint === 'string' && typeof q.explanation === 'string'); }
function showRoundError(message) { document.querySelector('#question-text').textContent = message; document.querySelector('#question-card').classList.remove('skeleton'); document.querySelector('#options').innerHTML = '<a class="button button-primary" href="inicio.html">Voltar ao início</a>'; document.querySelector('.quiz-actions').hidden = true; }
function goToResult(type) { location.href = `resultado.html?tipo=${type}`; }
