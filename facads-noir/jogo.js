const Jogo = {
  canvas: null,
  ctx: null,
  larguraLogica: 360,
  alturaLogica: 640,
  estado: 'inicio', // inicio, historia, jogando, transicao, fim
  casoAtual: 0,
  pontos: 0,
  facasRestantes: 10,
  alvo: {
    x: 180,
    y: 180,
    raio: 55,
    angulo: 0,
    velocidade: 0.02
  },
  facasNoAlvo: [],
  facasAtiradas: [],
  facaAtual: null,
  tremerTempo: 0,
  recorde: 0,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    try {
      this.recorde = localStorage.getItem('facada_noir_recorde') || 0;
    } catch(e) {
      this.recorde = 0;
    }

    Controles.init(this.canvas, () => {
      if (this.estado === 'jogando') {
        this.atirarFaca();
      }
    });

    this.redimensionar();
    window.addEventListener('resize', () => this.redimensionar());

    this.mostrarTelaInicio();
    this.loop(0);
  },

  redimensionar() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  mudarEstado(novoEstado) {
    this.estado = novoEstado;
    const ui = document.getElementById('ui-overlay');
    ui.innerHTML = '';

    if (novoEstado === 'inicio') {
      this.mostrarTelaInicio();
    } else if (novoEstado === 'historia') {
      this.mostrarTelaHistoria();
    } else if (novoEstado === 'fim') {
      this.mostrarTelaFim();
    }
  },

  mostrarTelaInicio() {
    const ui = document.getElementById('ui-overlay');
    ui.innerHTML = `
      <div class="screen-box">
        <h1>Facada Noir</h1>
        <p>Midnight City, 1947.<br>Mistério, chuva e lâminas precisas.</p>
        <p style="font-size:13px; margin-bottom:16px;">Recorde: ${this.recorde} pontos</p>
        <button class="btn" onclick="Sons.init(); Jogo.iniciarCaso(0)">Iniciar Caso</button>
      </div>
    `;
  },

  mostrarTelaHistoria() {
    const historia = Historia.dialogos[this.casoAtual];
    const ui = document.getElementById('ui-overlay');
    ui.innerHTML = `
      <div class="screen-box">
        <h2>${historia.titulo}</h2>
        <p>${historia.texto}</p>
        <button class="btn" onclick="Sons.init(); Jogo.iniciarJog1()">Aceitar Caso</button>
      </div>
    `;
  },

  iniciarCaso(index) {
    this.casoAtual = index;
    this.pontos = 0;
    this.mudarEstado('historia');
  },

  iniciarJog1() {
    this.facasRestantes = 8 + (this.casoAtual * 2);
    this.facasNoAlvo = [];
    this.facasAtiradas = [];
    this.alvo.velocidade = 0.015 + (this.casoAtual * 0.008);
    this.criarFacaAtual();
    this.mudarEstado('jogando');
  },

  criarFacaAtual() {
    this.facaAtual = {
      x: this.larguraLogica / 2,
      y: 540,
      velY: 0,
      estado: 'espera' // espera, atirada
    };
  },

  atirarFaca() {
    if (this.facaAtual && this.facaAtual.estado === 'espera') {
      this.facaAtual.estado = 'atirada';
      this.facaAtual.velY = -22;
      this.facasAtiradas.push(this.facaAtual);
      Sons.tocarFaca();
      this.facasRestantes--;
    }
  },

  atualizar(dt) {
    if (this.estado !== 'jogando') return;

    // Atualiza movimento do alvo (circular/oscilante)
    this.alvo.angulo += this.alvo.velocidade;
    
    // Tremedeira de tela
    if (this.tremerTempo > 0) {
      this.tremerTempo -= dt;
    }

    // Atualiza facas atiradas
    for (let i = this.facasAtiradas.length - 1; i >= 0; i--) {
      let f = this.facasAtiradas[i];
      if (f.estado === 'atirada') {
        f.y += f.velY;

        // Checa colisão com o alvo
        const alvoCentroX = this.alvo.x;
        const alvoCentroY = this.alvo.y;
        const dist = Math.hypot(f.x - alvoCentroX, f.y - alvoCentroY);

        if (dist <= this.alvo.raio) {
          // Acertou o alvo!
          f.estado = 'presa';
          // Calcula ângulo relativo no alvo
          const anguloRelativo = Math.atan2(f.y - alvoCentroY, f.x - alvoCentroX) - this.alvo.angulo;
          f.anguloRelativo = anguloRelativo;
          
          this.facasNoAlvo.push(f);
          this.facasAtiradas.splice(i, 1);
          this.pontos += 100;
          Sons.tocarAlvo();

          // Próxima faca ou vitória do caso
          if (this.facasRestantes > 0) {
            this.criarFacaAtual();
          } else {
            // Caso concluído
            this.avancarOuVencer();
          }
        } else {
          // Checa colisão com outras facas já presas
          for (let fpresa of this.facasNoAlvo) {
            const fx = this.alvo.x + Math.cos(fpresa.anguloRelativo + this.alvo.angulo) * this.alvo.raio;
            const fy = this.alvo.y + Math.sin(fpresa.anguloRelativo + this.alvo.angulo) * this.alvo.raio;
            if (Math.hypot(f.x - fx, f.y - fy) < 15) {
              // Bateu em outra faca! Erro!
              f.estado = 'caindo';
              f.velX = (Math.random() - 0.5) * 6;
              f.velY = 4;
              Sons.tocarErro();
              this.tremerTempo = 0.3;
              this.derrotaCaso();
              return;
            }
          }

          // Se passar do alvo sem bater
          if (f.y < this.alvo.y - this.alvo.raio - 20) {
            f.estado = 'caindo';
          }
        }
      } else if (f.estado === 'caindo') {
        f.y += f.velY;
        f.x += (f.velX || 0);
        f.velY += 1; // gravidade
      }
    }
  },

  avancarOuVencer() {
    this.casoAtual++;
    if (this.casoAtual < Historia.dialogos.length) {
      setTimeout(() => {
        this.mudarEstado('historia');
      }, 800);
    } else {
      Sons.tocarVitoria();
      setTimeout(() => {
        this.vitoriaTotal();
      }, 800);
    }
  },

  derrotaCaso() {
    Sons.tocarErro();
    setTimeout(() => {
      this.mudarEstado('fim');
    }, 600);
  },

  vitoriaTotal() {
    if (this.pontos > this.recorde) {
      this.recorde = this.pontos;
      try {
        localStorage.setItem('facada_noir_recorde', this.recorde);
      } catch(e) {}
    }
    const ui = document.getElementById('ui-overlay');
    const fim = Historia.finais.vitoria;
    ui.innerHTML = `
      <div class="screen-box">
        <h1>${fim.titulo}</h1>
        <p>${fim.texto}</p>
        <p style="margin-bottom:16px; color:var(--accent);">Pontuação: ${this.pontos}</p>
        <button class="btn" onclick="Jogo.mudarEstado('inicio')">Jogar Novamente</button>
      </div>
    `;
    this.estado = 'fim';
  },

  mostrarTelaFim() {
    if (this.pontos > this.recorde) {
      this.recorde = this.pontos;
      try {
        localStorage.setItem('facada_noir_recorde', this.recorde);
      } catch(e) {}
    }
    const ui = document.getElementById('ui-overlay');
    const fim = Historia.finais.derrota;
    ui.innerHTML = `
      <div class="screen-box">
        <h1 style="color:var(--accent-red);">${fim.titulo}</h1>
        <p>${fim.texto}</p>
        <p style="margin-bottom:16px;">Pontuação: ${this.pontos}</p>
        <button class="btn" onclick="Jogo.mudarEstado('inicio')">Tentar Novamente</button>
      </div>
    `;
  },

  desenhar() {
    const ctx = this.ctx;
    ctx.save();

    // Efeito de tremer tela
    if (this.tremerTempo > 0) {
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 8;
      ctx.translate(offsetX, offsetY);
    }

    // Fundo escuro noir
    ctx.fillStyle = '#090a0f';
    ctx.fillRect(0, 0, this.larguraLogica, this.alturaLogica);

    // Chuva sutil de fundo
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      let rx = (i * 37 + (Date.now() * 0.1) % this.alturaLogica) % this.larguraLogica;
      let ry = (i * 53 + (Date.now() * 0.3) % this.alturaLogica) % this.alturaLogica;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 15);
      ctx.stroke();
    }

    if (this.estado === 'jogando' || this.estado === 'transicao') {
      // Desenhar Alvo (Silhueta de Investigação / Alvo Noir)
      ctx.save();
      ctx.translate(this.alvo.x, this.alvo.y);
      
      // Círculo externo do alvo
      ctx.fillStyle = '#141722';
      ctx.beginPath();
      ctx.arc(0, 0, this.alvo.raio, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d4af37';
      ctx.stroke();

      // Alvos concêntricos
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.alvo.raio * 0.66, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, this.alvo.raio * 0.33, 0, Math.PI * 2);
      ctx.stroke();

      // Ícone central ou mira
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar facas presas no alvo
      for (let fpresa of this.facasNoAlvo) {
        ctx.save();
        const ang = fpresa.anguloRelativo + this.alvo.angulo;
        ctx.rotate(ang + Math.PI / 2);
        ctx.translate(0, this.alvo.raio);
        this.desenharFacaGrafico(ctx, 0, 0, true);
        ctx.restore();
      }

      ctx.restore();

      // Desenhar facas atiradas no ar
      for (let f of this.facasAtiradas) {
        if (f.estado === 'atirada' || f.estado === 'caindo') {
          ctx.save();
          ctx.translate(f.x, f.y);
          this.desenharFacaGrafico(ctx, 0, 0, false);
          ctx.restore();
        }
      }

      // Desenhar faca atual na mão (embaixo)
      if (this.facaAtual && this.facaAtual.estado === 'espera') {
        ctx.save();
        ctx.translate(this.facaAtual.x, this.facaAtual.y);
        this.desenharFacaGrafico(ctx, 0, 0, false);
        ctx.restore();
      }

      // HUD superior
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Caso: ${this.casoAtual + 1}`, 20, 35);
      ctx.textAlign = 'right';
      ctx.fillText(`Pontos: ${this.pontos}`, this.larguraLogica - 20, 35);

      // Facas restantes (ícones na parte inferior)
      ctx.textAlign = 'left';
      ctx.fillText(`Lâminas: ${this.facasRestantes}`, 20, this.alturaLogica - 20);
    }

    ctx.restore();
  },

  desenharFacaGrafico(ctx, x, y, presa) {
    // Desenho vetorial estilizado de uma faca noir
    ctx.save();
    ctx.translate(x, y);
    
    // Lâmina
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(4, -5);
    ctx.lineTo(4, 10);
    ctx.lineTo(-4, 10);
    ctx.lineTo(-4, -5);
    ctx.closePath();
    ctx.fill();

    // Cabo
    ctx.fillStyle = '#334155';
    ctx.fillRect(-3, 10, 6, 16);

    // Guarda da faca
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-6, 8, 12, 3);

    ctx.restore();
  },

  loop(timestamp) {
    const dt = 0.016;
    this.atualizar(dt);
    this.desenhar();
    requestAnimationFrame((ts) => this.loop(ts));
  }
};

window.addEventListener('load', () => {
  Jogo.init();
});