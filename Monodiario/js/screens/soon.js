export function soon(root, titulo, texto) {
  root.innerHTML = '<div class="soon"><h1></h1><p></p></div>';
  root.querySelector('h1').textContent = titulo;
  root.querySelector('p').textContent = texto;
}
