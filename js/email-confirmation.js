document.addEventListener('DOMContentLoaded', () => {
  const parameters = new URLSearchParams(location.hash.slice(1));
  const accessToken = parameters.get('access_token');
  const errorCode = parameters.get('error_code') || parameters.get('error');
  const title = document.querySelector('#confirmation-title');
  const message = document.querySelector('#confirmation-message');
  const action = document.querySelector('#confirmation-action');
  const mascot = document.querySelector('#confirmation-mascot');

  if (errorCode) {
    title.textContent = 'Não foi possível confirmar';
    message.textContent = 'O link pode ter expirado ou já ter sido utilizado. Entre na sua conta ou faça um novo cadastro.';
    action.textContent = 'Voltar para entrar';
    action.href = 'entrar.html';
    mascot.src = 'assets/mascote_triste.svg';
    return;
  }

  if (accessToken) {
    window.Api.token = accessToken;
    history.replaceState(null, '', location.pathname);
    action.href = 'inicio.html';
  }
});
