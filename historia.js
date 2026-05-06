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

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  emit(x, y, color, type = 'star', count = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        size: Math.random() * 15 + 10,
        color: color,
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        type: type,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life -= p.decay;
      p.rot += p.rotSpeed;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rot);
      this.ctx.globalAlpha = p.life;
      this.ctx.font = `${p.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.type === 'star' ? '⭐' : '✨', 0, 0);
      this.ctx.restore();
    }
    requestAnimationFrame(() => this.animate());
  }
}

class AvatarRenderer {
  constructor() {
    this.base = '👧';
    this.accessory = null;
    
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
    this.base = icon;
    document.querySelectorAll('.base-btn').forEach(b => b.classList.remove('selected'));
    if(btnElement) btnElement.classList.add('selected');
    this.render('builder-base', 'builder-acc');
  }

  setAccessory(icon, btnElement) {
    this.accessory = icon;
    document.querySelectorAll('.acc-btn').forEach(b => b.classList.remove('selected'));
    if(btnElement) btnElement.classList.add('selected');
    this.render('builder-base', 'builder-acc');
  }

  render(baseId, accId) {
    const baseEl = document.getElementById(baseId);
    const accEl = document.getElementById(accId);
    
    baseEl.innerText = this.base;
    
    if (this.accessory) {
      accEl.innerText = this.accessory;
      const anchors = this.baseAnchors[this.base] || this.baseAnchors['👧'];
      const config = this.accConfig[this.accessory];
      const anchorPt = anchors[config.anchor];
      const finalX = anchorPt.x + config.offsetX;
      const finalY = anchorPt.y + config.offsetY;
      accEl.style.transform = `translate(${finalX}px, ${finalY}px) scale(${config.scale}) rotate(${config.rot}deg)`;
      accEl.classList.add('visible');
    } else {
      accEl.classList.remove('visible');
      accEl.style.transform = `scale(0)`;
    }
  }

  cloneTo(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="base-layer" id="${containerId}-base"></div>
      <div class="acc-layer" id="${containerId}-acc"></div>
    `;
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
   SISTEMA DE HISTORIA DEL PERÚ
   ========================================== */
class HistoryGenerator {
  static generate() {
    const stories = [
      {
        icon: "🏔️", title: "El Mensajero del Inca",
        passage: "Dorothy y Toto aparecieron en lo alto de los Andes. Un corredor muy veloz llamado 'Chasqui' se detuvo a descansar. Le contó que llevaba un mensaje importante atado en unos hilos con nudos de colores llamados Quipus, corriendo por los caminos del Tahuantinsuyo.",
        q: "¿Qué utilizaban los Incas para llevar cuentas y mensajes?",
        options: ["Hojas de papel.", "Piedras talladas.", "Quipus (hilos con nudos).", "Botellas de vidrio."],
        a: 2
      },
      {
        icon: "🗿", title: "El Templo de Piedra",
        passage: "El León Cobarde vio una enorme cabeza de piedra clavada en un muro y dio un salto de susto. Un antiguo sacerdote le explicó que estaban en Chavín de Huántar, y esas esculturas, llamadas 'Cabezas Clavas', protegían el templo de los malos espíritus.",
        q: "¿Cómo se llamaban las esculturas de piedra que asustaron al León en Chavín?",
        options: ["Cabezas Clavas.", "Huacos Retratos.", "Líneas de Nasca.", "Keros de oro."],
        a: 0
      },
      {
        icon: "🦅", title: "El Sueño de la Bandera",
        passage: "El Espantapájaros despertó en una playa soleada. Junto a él, un general llamado Don José de San Martín miraba al cielo. Había soñado con unas hermosas aves de alas rojas y pecho blanco llamadas parihuanas, y decidió que esos serían los colores de la bandera del nuevo país: ¡Perú!",
        q: "¿Qué aves inspiraron los colores de la bandera del Perú en el sueño de San Martín?",
        options: ["Palomas.", "Cóndores.", "Parihuanas.", "Gaviotas."],
        a: 2
      },
      {
        icon: "🧵", title: "Los Mantos del Desierto",
        passage: "El Hombre de Hojalata caminaba por el desierto y se maravilló al encontrar unas telas enterradas, con colores vibrantes que no se habían borrado en cientos de años. Eran los famosos mantos de la Cultura Paracas, conocidos por ser los mejores tejedores del antiguo Perú.",
        q: "¿Por qué habilidad es famosa la Cultura Paracas?",
        options: ["Por sus enormes barcos.", "Por ser los mejores tejedores (mantos).", "Por construir armas de fuego.", "Por escribir libros de cuentos."],
        a: 1
      },
      {
        icon: "☀️", title: "El Inti Raymi",
        passage: "Todo el camino de baldosas amarillas desapareció para convertirse en una fiesta llena de colores en el Cusco. Dorothy vio al Inca levantando sus manos hacia el cielo para agradecer al Sol (Inti) por las buenas cosechas. ¡Estaban celebrando el Inti Raymi!",
        q: "¿A quién agradecían los Incas durante la fiesta del Inti Raymi?",
        options: ["Al viento.", "A la lluvia.", "A la luna.", "Al Sol (Inti)."],
        a: 3
      }
    ];
    
    return stories[Math.floor(Math.random() * stories.length)];
  }
}

/* ==========================================
   SISTEMA DE LOGROS GLOBALES
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
   MOTOR DE JUEGO DE HISTORIA
   ========================================== */
class HistoryEngine {
  constructor(particleSystem) {
    this.ps = particleSystem;
    this.totalLevels = 10; // 10 épocas a visitar para ganar
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
    const progress = (this.currentLevel / this.totalLevels) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
  }

  loadLevel() {
    this.isLevelActive = true;
    const data = HistoryGenerator.generate();
    this.currentAnswer = data.a;

    document.getElementById('level-title').innerText = `${data.icon} Época ${this.currentLevel + 1}: ${data.title}`;
    document.getElementById('level-passage').innerText = data.passage;
    document.getElementById('level-question').innerHTML = `⏳ Viaje en el tiempo<br><br>${data.q}`;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    data.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.id = `opt-${index}`;
      btn.innerText = `${String.fromCharCode(65 + index)}. ${optText}`;
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
      
      resultDiv.innerText = `✅ ¡Excelente memoria histórica! +${earnedStars} ⭐`;
      resultDiv.style.color = "#00b894";
      
      if (this.currentLevel === 0) {
        GameApp.achievements.unlock('first_history', '🏺', 'Primer viaje en el tiempo completado.');
      }
      if (this.currentLevel === 9) {
        GameApp.achievements.unlock('history_10', '👑', 'Visitaste 10 épocas históricas.');
      }
      
      const btnRect = document.getElementById(`opt-${selectedIndex}`).getBoundingClientRect();
      this.ps.emit(btnRect.left + btnRect.width/2, btnRect.top, '#55efc4', 'star', 30);
      SoundMagic.play('correct');
    } else {
      document.getElementById(`opt-${selectedIndex}`).classList.add('incorrect');
      document.getElementById(`opt-${this.currentAnswer}`).classList.add('correct');
      
      this.combo = 1;
      resultDiv.innerText = "❌ La historia es diferente, intenta recordarlo para la próxima.";
      resultDiv.style.color = "#d63031";
      SoundMagic.play('incorrect');
    }

    this.updateHUD();
    GameApp.saveProgress(this.currentLevel + 1, this.stars);
    
    const nextBtn = document.getElementById('next-btn');
    nextBtn.style.display = 'block';
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel < this.totalLevels) {
      this.loadLevel();
    } else {
      this.showVictory();
    }
  }

  showVictory() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-victory').classList.add('active');
    document.getElementById('final-stars').innerText = `⭐ ${this.stars}`;
    GameApp.avatarRenderer.cloneTo('victory-avatar');
    localStorage.removeItem('oz_historia_save_data');
    
    setInterval(() => {
      this.ps.emit(window.innerWidth/2, window.innerHeight, '#f6e58d', 'star', 15);
    }, 800);
  }
}

/* ==========================================
   INICIALIZACIÓN DEL JUEGO
   ========================================== */
var GameApp = {
  particleSystem: new ParticleSystem(),
  avatarRenderer: new AvatarRenderer(),
  engine: null,

  init: function() {
    this.achievements = new AchievementSystem();

    const saved = localStorage.getItem('oz_historia_save_data'); // CLAVE PARA HISTORIA
    if (saved) {
      const data = JSON.parse(saved);
      this.avatarRenderer.setBase(data.base);
      if (data.acc) this.avatarRenderer.setAccessory(data.acc);
      document.getElementById('continue-btn').style.display = 'block';
      document.getElementById('reset-btn').style.display = 'block';
      this.savedData = data;
    }
  },
  
  startGame: function(isNew = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active');
    this.avatarRenderer.cloneTo('hud-avatar');
    this.engine = new HistoryEngine(this.particleSystem);
    
    if (!isNew && this.savedData) { 
      this.engine.stars = this.savedData.stars; 
      this.engine.currentLevel = this.savedData.level; 
    }
    this.engine.loadLevel();
  },
  
  saveProgress: function(level, stars) {
    const data = { base: this.avatarRenderer.base, acc: this.avatarRenderer.accessory, level: level, stars: stars };
    localStorage.setItem('oz_historia_save_data', JSON.stringify(data));
  },

  resetData: function() {
    if (confirm("¿Estás seguro que deseas reiniciar tus viajes en el tiempo?")) {
      localStorage.removeItem('oz_historia_save_data');
      location.reload();
    }
  }
};

window.onload = () => GameApp.init();