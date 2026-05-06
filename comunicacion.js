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
      '🪄': { anchor: 'hand', offsetX: 0, offsetY: 0, scale: 0.65, rot: 45 },
      '🧢': { anchor: 'head', offsetX: 0, offsetY: -5, scale: 0.7, rot: -10 },
      '🛡️': { anchor: 'hand', offsetX: -10, offsetY: 5, scale: 0.8, rot: 0 },
      '🗡️': { anchor: 'hand', offsetX: 10, offsetY: -10, scale: 0.7, rot: -45 },
      '🌸': { anchor: 'head', offsetX: -20, offsetY: 10, scale: 0.5, rot: -20 },
      '🎭': { anchor: 'face', offsetX: 0, offsetY: -5, scale: 0.8, rot: 0 }
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
      const hasMath = this.unlocked.includes('first_math');
      const hasRead = this.unlocked.includes('first_reading');
      const hasHist = this.unlocked.includes('first_history');
      const hasMem  = this.unlocked.includes('first_match');
      const hasRiddle = this.unlocked.includes('first_riddle');
      const hasSci = this.unlocked.includes('first_science');
      const hasCom = this.unlocked.includes('first_communication');
      
      if (hasMath && hasRead && hasHist && hasMem && hasRiddle && hasSci && hasCom && id !== 'master_of_oz' && !this.unlocked.includes('master_of_oz')) {
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
   GENERADOR DE NIVELES (Comunicación)
   ========================================== */
class CommunicationGenerator {
  static generate(levelIndex) {
    const levels = [
      { // 1. Lectura y Palabras
        type: 'sequence', icon: '🔤', title: 'Palabras: Arma la Palabra', 
        q: 'Toca las sílabas en el orden correcto para formar la palabra "ESMERALDA":', 
        options: ['ES', 'ME', 'RAL', 'DA'] 
      },
      { // 2. Lectura y Palabras
        type: 'quiz', icon: '🔤', title: 'Lectura: Encuentra la Correcta', 
        q: '¿Qué palabra está escrita correctamente?', 
        options: ['Espantapajaroz', 'Ezpantapájaros', 'Espantapájaros', 'Espantapájarus'], a: 2 
      },
      { // 3. Escritura
        type: 'sequence', icon: '✍️', title: 'Escritura: Ordena la Oración', 
        q: 'Toca las palabras para formar una oración con sentido:', 
        options: ['El', 'León', 'es', 'muy', 'valiente.'] 
      },
      { // 4. Escritura
        type: 'quiz', icon: '✍️', title: 'Escritura: Signos de Puntuación', 
        q: '¿Qué signo usamos siempre al terminar de escribir una oración?', 
        options: ['Una coma (,)', 'Un punto final (.)', 'Un signo de suma (+)', 'Una letra mayúscula'], a: 1 
      },
      { // 5. Vocabulario
        type: 'quiz', icon: '🧠', title: 'Vocabulario: Antónimos', 
        q: '¿Cuál es el antónimo (la palabra opuesta) de "VALIENTE"?', 
        options: ['Fuerte', 'Cobarde', 'Rápido', 'Inteligente'], a: 1 
      },
      { // 6. Expresión oral
        type: 'quiz', icon: '🔊', title: 'Expresión: Describe la Imagen', 
        q: 'Observa esto: 🌪️🏠. ¿Qué está pasando?', 
        options: ['Un día soleado en la playa.', 'Un tornado se está llevando la casa.', 'Una lluvia de estrellas.', 'Un castillo volador.'], a: 1 
      },
      { // 7. Tipos de texto
        type: 'quiz', icon: '🟣', title: 'Tipos de Texto', 
        q: 'Si un texto nos cuenta una historia de animales que hablan y nos deja una moraleja o enseñanza, ¿qué es?', 
        options: ['Una receta', 'Un poema', 'Una fábula', 'Una noticia'], a: 2 
      },
      { // 8. Secuencia y orden
        type: 'sequence', icon: '🟡', title: 'Secuencia: Ordena la Historia', 
        q: 'Ordena la historia para que tenga sentido (Inicio, Desarrollo, Final):', 
        options: ['1. Había una niña llamada Dorothy.', '2. Un tornado la llevó a Oz.', '3. Finalmente, regresó a casa.'] 
      },
      { // 9. Comprensión inferencial
        type: 'quiz', icon: '🔵', title: 'Comprensión Inferencial', 
        q: 'El Hombre de Hojalata empezó a llorar de emoción y sus rodillas sonaron "ñick, ñick". ¿Qué pasará después si sigue llorando?', 
        options: ['Se convertirá en oro.', 'Se oxidará y no podrá moverse.', 'Volverá a ser de carne.', 'Empezará a volar.'], a: 1 
      },
      { // 10. Vocabulario
        type: 'quiz', icon: '🧠', title: 'Vocabulario: Sinónimos', 
        q: '¿Cuál es el sinónimo (palabra que significa lo mismo) de "CAMINO"?', 
        options: ['Cielo', 'Sendero', 'Río', 'Muro'], a: 1 
      }
    ];
    return levels[levelIndex % levels.length];
  }
}

/* ==========================================
   MOTOR DEL JUEGO
   ========================================== */
class CommunicationEngine {
  constructor(particleSystem) {
    this.ps = particleSystem;
    this.totalLevels = 10;
    this.reset();
  }

  reset() {
    this.stars = 0; 
    this.combo = 1; 
    this.currentLevel = 0;
    this.currentAnswer = -1; 
    this.isLevelActive = false;
  }

  updateHUD() {
    document.getElementById('hud-stars').innerText = `⭐ ${this.stars}`;
    document.getElementById('hud-combo').innerText = `🔥 x${this.combo}`;
    document.getElementById('progress').style.width = `${(this.currentLevel / this.totalLevels) * 100}%`;
  }

  loadLevel() {
    this.isLevelActive = true;
    const data = CommunicationGenerator.generate(this.currentLevel);
    this.currentAnswer = data.a;

    document.getElementById('level-title').innerText = `${data.icon} Nivel ${this.currentLevel + 1}: ${data.title}`;
    
    const qDiv = document.getElementById('level-question');
    qDiv.innerHTML = data.q;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // Dinámica especial: Secuencias (Tocar en orden)
    if (data.type === 'sequence') {
        this.sequenceStep = 0;
        this.sequenceTarget = data.options.length;
        
        let shuffled = data.options.map((text, index) => ({text, index})).sort(() => Math.random() - 0.5);
        
        shuffled.forEach((obj) => {
          const btn = document.createElement('button');
          btn.className = 'option-btn sequence-btn';
          btn.innerText = obj.text;
          btn.onclick = () => this.checkSequence(obj.index, btn);
          optionsContainer.appendChild(btn);
        });
    } 
    // Dinámica normal de Cuestionario
    else {
        data.options.forEach((optText, index) => {
          const btn = document.createElement('button');
          btn.className = 'option-btn';
          btn.id = `opt-${index}`;
          btn.innerText = optText;
          btn.onclick = () => this.checkAnswer(index);
          optionsContainer.appendChild(btn);
        });
    }

    document.getElementById('level-result').innerText = '';
    document.getElementById('next-btn').style.display = 'none';
    this.updateHUD();
  }

  checkSequence(correctIndex, btnElement) {
    if (!this.isLevelActive) return;
    const resultDiv = document.getElementById('level-result');
    
    if (correctIndex === this.sequenceStep) {
        btnElement.classList.add('correct');
        btnElement.disabled = true;
        this.sequenceStep++;
        
        const rect = btnElement.getBoundingClientRect();
        this.ps.emit(rect.left + rect.width/2, rect.top, '#a29bfe', 'star', 15);
        
        if (this.sequenceStep === this.sequenceTarget) {
            this.isLevelActive = false;
            const baseDiff = parseInt(localStorage.getItem('oz_difficulty')) || 1;
            const earnedStars = (2 * this.combo) * baseDiff;
            this.stars += earnedStars;
            this.combo++;
            
            resultDiv.innerText = `✅ ¡Estructura perfecta! +${earnedStars} ⭐`;
            resultDiv.style.color = "#00b894";
            this.winLevelLogic();
        } else {
            resultDiv.innerText = "¡Bien! Sigue uniendo las partes.";
            resultDiv.style.color = "#f6e58d";
            SoundMagic.play('correct');
        }
    } else {
        btnElement.classList.add('incorrect');
        setTimeout(() => btnElement.classList.remove('incorrect'), 500);
        
        this.combo = 1;
        this.sequenceStep = 0;
        resultDiv.innerText = "❌ Orden incorrecto. ¡Vuelve a intentarlo desde el principio!";
        resultDiv.style.color = "#d63031";
        SoundMagic.play('incorrect');
        this.updateHUD();
        
        document.querySelectorAll('.sequence-btn').forEach(b => {
            b.classList.remove('correct', 'incorrect');
            b.disabled = false;
        });
    }
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
      
      resultDiv.innerText = `✅ ¡Respuesta elocuente! +${earnedStars} ⭐`;
      resultDiv.style.color = "#00b894";
      
      const btnRect = document.getElementById(`opt-${selectedIndex}`).getBoundingClientRect();
      this.ps.emit(btnRect.left + btnRect.width/2, btnRect.top, '#a29bfe', 'star', 30);
      this.winLevelLogic();
      SoundMagic.play('correct');
    } else {
      document.getElementById(`opt-${selectedIndex}`).classList.add('incorrect');
      document.getElementById(`opt-${this.currentAnswer}`).classList.add('correct'); 
      
      this.combo = 1;
      resultDiv.innerText = "❌ Lee con cuidado e intenta de nuevo.";
      resultDiv.style.color = "#d63031";
      SoundMagic.play('incorrect');
      
      this.updateHUD();
      GameApp.saveProgress(this.currentLevel + 1, this.stars);
      document.getElementById('next-btn').style.display = 'block';
    }
  }

  winLevelLogic() {
      if (this.currentLevel === 0) GameApp.achievements.unlock('first_communication', '🗣️', 'Descubriste el poder de las palabras.');
      if (this.currentLevel === 9) GameApp.achievements.unlock('communication_10', '📜', 'Completaste 10 niveles de Comunicación.');
      
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
    localStorage.removeItem('oz_comunicacion_save_data');
    setInterval(() => this.ps.emit(window.innerWidth/2, window.innerHeight, '#6c5ce7', 'star', 15), 800);
  }
}

/* ==========================================
   INICIALIZACIÓN DEL JUEGO
   ========================================== */
var GameApp = {
  particleSystem: new ParticleSystem(), avatarRenderer: new AvatarRenderer(), engine: null,
  init: function() {
    this.achievements = new AchievementSystem();
    const saved = localStorage.getItem('oz_comunicacion_save_data');
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
    this.engine = new CommunicationEngine(this.particleSystem);
    if (!isNew && this.savedData) { this.engine.stars = this.savedData.stars; this.engine.currentLevel = this.savedData.level; }
    this.engine.loadLevel();
  },
  saveProgress: function(level, stars) {
    localStorage.setItem('oz_comunicacion_save_data', JSON.stringify({ base: this.avatarRenderer.base, acc: this.avatarRenderer.accessory, level: level, stars: stars }));
  },
  resetData: function() { if (confirm("¿Borrar tu historial de Comunicación?")) { localStorage.removeItem('oz_comunicacion_save_data'); location.reload(); } }
};
window.onload = () => GameApp.init();