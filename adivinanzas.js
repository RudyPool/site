/* ==========================================
   REUTILIZAMOS PARTÍCULAS Y AVATAR
   ========================================== */
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('magic-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
  emit(x, y, color, type = 'star', count = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x, y: y, vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15 - 5,
        size: Math.random() * 15 + 10, color: color, life: 1, decay: Math.random() * 0.02 + 0.01,
        type: type, rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= p.decay; p.rot += p.rotSpeed;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      this.ctx.save();
      this.ctx.translate(p.x, p.y); this.ctx.rotate(p.rot);
      this.ctx.globalAlpha = p.life; this.ctx.font = `${p.size}px Arial`;
      this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.type === 'star' ? '⭐' : '✨', 0, 0);
      this.ctx.restore();
    }
    requestAnimationFrame(() => this.animate());
  }
}

class AvatarRenderer {
  constructor() {
    this.base = '👧'; this.accessory = null;
    this.baseAnchors = {
      '👧': { head: {x: 0, y: -35}, face: {x: 0, y: -5}, hand: {x: 35, y: 25} },
      '🦁': { head: {x: 0, y: -45}, face: {x: 0, y: 0},  hand: {x: 40, y: 30} },
      '🤖': { head: {x: 0, y: -35}, face: {x: 0, y: -5}, hand: {x: 35, y: 25} },
      '🌾': { head: {x: 0, y: -30}, face: {x: 0, y: -10},hand: {x: 30, y: 15} },
      '🐶': { head: {x: 0, y: -40}, face: {x: 0, y: 5},  hand: {x: 35, y: 25} }
    };
    this.accConfig = {
      '🎀': { anchor: 'head', offsetX: 20, offsetY: 0, scale: 0.55, rot: 15 },
      '👑': { anchor: 'head', offsetX: 0, offsetY: -5, scale: 0.65, rot: 0 },
      '🎩': { anchor: 'head', offsetX: 0, offsetY: -10, scale: 0.7, rot: -5 },
      '👓': { anchor: 'face', offsetX: 0, offsetY: 0, scale: 0.85, rot: 0 },
      '🪄': { anchor: 'hand', offsetX: 0, offsetY: 0, scale: 0.65, rot: 45 }
    };
  }
  setBase(icon, btnElement) {
    this.base = icon; document.querySelectorAll('.base-btn').forEach(b => b.classList.remove('selected'));
    if(btnElement) btnElement.classList.add('selected'); this.render('builder-base', 'builder-acc');
  }
  setAccessory(icon, btnElement) {
    this.accessory = icon; document.querySelectorAll('.acc-btn').forEach(b => b.classList.remove('selected'));
    if(btnElement) btnElement.classList.add('selected'); this.render('builder-base', 'builder-acc');
  }
  render(baseId, accId) {
    const baseEl = document.getElementById(baseId), accEl = document.getElementById(accId);
    baseEl.innerText = this.base;
    if (this.accessory) {
      accEl.innerText = this.accessory;
      const anchors = this.baseAnchors[this.base] || this.baseAnchors['👧'];
      const config = this.accConfig[this.accessory];
      accEl.style.transform = `translate(${anchors[config.anchor].x + config.offsetX}px, ${anchors[config.anchor].y + config.offsetY}px) scale(${config.scale}) rotate(${config.rot}deg)`;
      accEl.classList.add('visible');
    } else { accEl.classList.remove('visible'); accEl.style.transform = `scale(0)`; }
  }
  cloneTo(containerId) {
    document.getElementById(containerId).innerHTML = `<div class="base-layer" id="${containerId}-base"></div><div class="acc-layer" id="${containerId}-acc"></div>`;
    this.render(`${containerId}-base`, `${containerId}-acc`);
  }
}

/* ==========================================
   SISTEMA DE AUDIO MÁGICO (SONIDOS)
   ========================================== */
class SoundMagic {
  static ctx = null;
  static play(type) {
    try {
      if (!window.AudioContext && !window.webkitAudioContext) return;
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
      } else if (type === 'incorrect') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'achievement') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now); osc.stop(now + 0.6);
      }
    } catch(e) { console.warn("Audio error:", e); }
  }
}

/* ==========================================
   SISTEMA DE LOGROS GLOBALIZADO
   ========================================== */
class AchievementSystem {
  constructor() {
    this.unlocked = JSON.parse(localStorage.getItem('oz_achievements')) || [];
    this.createPopupElement();
  }

  createPopupElement() {
    this.popup = document.createElement('div');
    this.popup.className = 'achievement-popup';
    this.popup.innerHTML = `
      <div class="achievement-icon" id="ach-icon">🏆</div>
      <div class="achievement-text">
        <h4>¡Logro Desbloqueado!</h4>
        <p id="ach-desc">Descripción del logro</p>
      </div>
    `;
    document.body.appendChild(this.popup);
  }

  unlock(id, icon, description) {
    if (!this.unlocked.includes(id)) {
      this.unlocked.push(id);
      localStorage.setItem('oz_achievements', JSON.stringify(this.unlocked));
      this.showPopup(icon, description);
      if (GameApp && GameApp.particleSystem) {
        GameApp.particleSystem.emit(window.innerWidth / 2, window.innerHeight - 50, '#f6e58d', 'star', 20);
      }
      SoundMagic.play('achievement');

      // --- REVISIÓN GLOBAL ---
      // Verifica si el jugador tiene logros de todos los minijuegos.
      const hasMath = this.unlocked.includes('first_math');
      const hasRead = this.unlocked.includes('first_reading');
      const hasHist = this.unlocked.includes('first_history');
      const hasMem  = this.unlocked.includes('first_match');
      const hasRiddle = this.unlocked.includes('first_riddle');
      const hasSci = this.unlocked.includes('first_science');
      const hasCom = this.unlocked.includes('first_communication');
      
      if (hasMath && hasRead && hasHist && hasMem && hasRiddle && hasSci && hasCom && id !== 'master_of_oz' && !this.unlocked.includes('master_of_oz')) {
        // Retrasamos el popup del logro maestro para no sobreescribir el actual
        setTimeout(() => {
          this.unlock('master_of_oz', '👑', '¡Jugaste TODOS los minijuegos de la Academia de Oz!');
        }, 4500);
      }
    }
  }

  showPopup(icon, description) {
    document.getElementById('ach-icon').innerText = icon;
    document.getElementById('ach-desc').innerText = description;
    this.popup.classList.add('show');
    setTimeout(() => this.popup.classList.remove('show'), 4000);
  }
}

/* ==========================================
   GENERADOR DE ACERTIJOS (Para ~12 años)
   ========================================== */
class RiddleGenerator {
  static generate() {
    const riddles = [
      {
        icon: "🗺️", title: "El Mundo de Papel",
        text: "Tengo ciudades, pero no casas. Tengo montañas, pero no árboles. Tengo océanos, pero no peces. ¿Qué soy?",
        options: ["Un mundo alienígena", "Un mapa", "Una pintura abstracta", "La imaginación"],
        a: 1
      },
      {
        icon: "🕳️", title: "El Vacío",
        text: "Cuanto más me quitas, más grande me vuelvo. ¿Qué soy?",
        options: ["Un agujero", "Un problema", "Un globo de aire", "Un pastel"],
        a: 0
      },
      {
        icon: "🗣️", title: "Lo Tuyo",
        text: "Es tuyo y te pertenece desde que naciste, pero los demás lo usan mucho más que tú. ¿Qué es?",
        options: ["Tu número de teléfono", "Tu apellido", "Tu nombre", "Tu ropa favorita"],
        a: 2
      },
      {
        icon: "💧", title: "El Viajero",
        text: "Siempre corro, pero nunca camino. A menudo murmuro, pero nunca hablo. Tengo lecho, pero nunca duermo. Tengo boca, pero nunca como. ¿Qué soy?",
        options: ["El viento del norte", "Un río", "Un océano profundo", "Un volcán activo"],
        a: 1
      },
      {
        icon: "🤫", title: "El Vínculo",
        text: "Te pertenezco solo a ti, pero si me compartes con otra persona, inmediatamente dejas de tenerme. ¿Qué soy?",
        options: ["Un secreto", "Una gran idea", "Una promesa", "Un tesoro escondido"],
        a: 0
      },
      {
        icon: "🏔️", title: "El Gigante",
        text: "Tengo raíces que nadie puede ver. Soy más alta que los árboles más altos. Subo y subo hacia las nubes, y sin embargo nunca crezco. ¿Qué soy?",
        options: ["Un rascacielos", "Un rayo de luz", "Una montaña", "Un ave gigante"],
        a: 2
      },
      {
        icon: "☁️", title: "El Viajero del Cielo",
        text: "Vuelo sin tener alas, lloro sin tener ojos. Dondequiera que voy, la sombra me persigue. ¿Qué soy?",
        options: ["Un fantasma", "Una nube oscura", "Un murciélago ciego", "La noche eterna"],
        a: 1
      },
      {
        icon: "🪞", title: "El Imitador",
        text: "Me puedes ver en el agua, me puedes ver en un cristal, te imito en todo, pero jamás me mojo ni hablo. ¿Qué soy?",
        options: ["Un pez plateado", "Una cámara mágica", "Un reflejo", "Una sombra traviesa"],
        a: 2
      },
      {
        icon: "🕯️", title: "La Vida Breve",
        text: "Nazco siendo alta y muy grande, pero muero siendo muy pequeña y bajita, mientras iluminando el camino me derrito. ¿Qué soy?",
        options: ["Una estrella fugaz", "Una vela", "Un bloque de hielo", "Una linterna"],
        a: 1
      },
      {
        icon: "🌬️", title: "El Invisible",
        text: "Corto sin tener cuchillo, corro sin tener piernas. Siempre estoy a tu alrededor pero jamás podrás verme con tus ojos. ¿Qué soy?",
        options: ["El silencio absoluto", "La oscuridad", "La lluvia", "El viento"],
        a: 3
      },
      {
        icon: "🤐", title: "El Frágil",
        text: "Soy tan frágil que con tan solo decir mi nombre me rompes al instante. ¿Qué soy?",
        options: ["El silencio", "Una copa de cristal", "Un hechizo", "El hielo"],
        a: 0
      },
      {
        icon: "📅", title: "El Adelantado",
        text: "Nunca fui, siempre seré. Nadie me ha visto nunca, ni jamás me verá. Sin embargo, soy la esperanza de todos los que viven y respiran. ¿Qué soy?",
        options: ["La luz", "El día de mañana", "Un sueño profundo", "El universo"],
        a: 1
      }
    ];
    return riddles[Math.floor(Math.random() * riddles.length)];
  }
}

/* ==========================================
   MOTOR DEL JUEGO
   ========================================== */
class RiddleEngine {
  constructor(particleSystem) {
    this.ps = particleSystem;
    this.totalLevels = 10;
    this.reset();
  }

  reset() {
    this.stars = 0; this.combo = 1; this.currentLevel = 0;
    this.currentAnswer = -1; this.isLevelActive = false;
  }

  updateHUD() {
    document.getElementById('hud-stars').innerText = `⭐ ${this.stars}`;
    document.getElementById('hud-combo').innerText = `🔥 x${this.combo}`;
    document.getElementById('progress').style.width = `${(this.currentLevel / this.totalLevels) * 100}%`;
  }

  loadLevel() {
    this.isLevelActive = true;
    const data = RiddleGenerator.generate();
    this.currentAnswer = data.a;

    document.getElementById('level-title').innerText = `${data.icon} Reto ${this.currentLevel + 1}: ${data.title}`;
    document.getElementById('level-passage').innerText = `"${data.text}"`;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    data.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.id = `opt-${index}`;
      btn.innerText = optText;
      btn.onclick = () => this.checkAnswer(index);
      optionsContainer.appendChild(btn);
    });

    document.getElementById('level-result').innerText = '';
    document.getElementById('next-btn').style.display = 'none';
    this.updateHUD();
  }

  checkAnswer(selectedIndex) {
    if (!this.isLevelActive) return;
    this.isLevelActive = false; 
    
    const resultDiv = document.getElementById('level-result');
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    if (selectedIndex === this.currentAnswer) {
      document.getElementById(`opt-${selectedIndex}`).classList.add('correct');
      
      const baseDiff = parseInt(localStorage.getItem('oz_difficulty')) || 1;
      const earnedStars = (2 * this.combo) * baseDiff; 
      this.stars += earnedStars;
      this.combo++; 
      
      resultDiv.innerText = `✅ ¡Ingenio puro! +${earnedStars} ⭐`;
      resultDiv.style.color = "#00b894";
      
      if (this.currentLevel === 0) GameApp.achievements.unlock('first_riddle', '🧙‍♂️', 'Resolviste tu primera adivinanza.');
      if (this.currentLevel === 9) GameApp.achievements.unlock('riddle_10', '👁️‍🗨️', 'Completaste 10 acertijos mágicos.');
      
      const btnRect = document.getElementById(`opt-${selectedIndex}`).getBoundingClientRect();
      this.ps.emit(btnRect.left + btnRect.width/2, btnRect.top, '#55efc4', 'star', 30);
      SoundMagic.play('correct');
    } else {
      document.getElementById(`opt-${selectedIndex}`).classList.add('incorrect');
      document.getElementById(`opt-${this.currentAnswer}`).classList.add('correct'); 
      
      this.combo = 1;
      resultDiv.innerText = "❌ El acertijo ha ganado esta vez.";
      resultDiv.style.color = "#d63031";
      SoundMagic.play('incorrect');
    }

    this.updateHUD();
    GameApp.saveProgress(this.currentLevel + 1, this.stars);
    document.getElementById('next-btn').style.display = 'block';
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel < this.totalLevels) this.loadLevel();
    else this.showVictory();
  }

  showVictory() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-victory').classList.add('active');
    document.getElementById('final-stars').innerText = `⭐ ${this.stars}`;
    GameApp.avatarRenderer.cloneTo('victory-avatar');
    localStorage.removeItem('oz_adivinanzas_save_data');
    setInterval(() => this.ps.emit(window.innerWidth/2, window.innerHeight, '#feca57', 'star', 15), 800);
  }
}

/* ==========================================
   INICIALIZACIÓN DEL JUEGO
   ========================================== */
var GameApp = {
  particleSystem: new ParticleSystem(), avatarRenderer: new AvatarRenderer(), engine: null,
  init: function() {
    this.achievements = new AchievementSystem();
    const saved = localStorage.getItem('oz_adivinanzas_save_data');
    if (saved) {
      const data = JSON.parse(saved);
      this.avatarRenderer.setBase(data.base); if (data.acc) this.avatarRenderer.setAccessory(data.acc);
      document.getElementById('continue-btn').style.display = 'block'; document.getElementById('reset-btn').style.display = 'block';
      this.savedData = data;
    }
  },
  startGame: function(isNew = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active');
    this.avatarRenderer.cloneTo('hud-avatar');
    this.engine = new RiddleEngine(this.particleSystem);
    if (!isNew && this.savedData) { this.engine.stars = this.savedData.stars; this.engine.currentLevel = this.savedData.level; }
    this.engine.loadLevel();
  },
  saveProgress: function(level, stars) {
    localStorage.setItem('oz_adivinanzas_save_data', JSON.stringify({ base: this.avatarRenderer.base, acc: this.avatarRenderer.accessory, level: level, stars: stars }));
  },
  resetData: function() { if (confirm("¿Borrar tu historial de acertijos?")) { localStorage.removeItem('oz_adivinanzas_save_data'); location.reload(); } }
};
window.onload = () => GameApp.init();