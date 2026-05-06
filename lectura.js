/* ==========================================
   REUTILIZAMOS PARTÍCULAS Y AVATAR DE MATEMÁTICAS
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
      p.vy += 0.3; // Gravedad
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
   SISTEMA DE HISTORIAS BÍBLICAS EN OZ
   ========================================== */
class ReadingGenerator {
  static generate() {
    const stories = [
      {
        icon: "🦁", title: "El León y el Pastor",
        passage: "Mientras caminaban por el Bosque, el León Cobarde temblaba de miedo. Dorothy le leyó de un antiguo pergamino la historia de un joven llamado David. Él no era guerrero, solo un pastor. Pero cuando el gigante Goliat amenazó a su pueblo, David no tuvo miedo, porque sabía que Dios estaba con él. Usó solo una honda y venció al gigante.",
        q: "¿Por qué David no tuvo miedo del gigante?",
        options: ["Porque tenía una espada muy grande.", "Porque sabía que Dios estaba con él.", "Porque el gigante era su amigo.", "Porque tomó una poción mágica."],
        a: 1
      },
      {
        icon: "🤖", title: "El Corazón del Samaritano",
        passage: "El Hombre de Hojalata estaba triste porque creía no tener corazón para amar. Dorothy le contó sobre el Buen Samaritano: Un hombre fue lastimado en el camino, y aunque muchos pasaron de largo ignorándolo, un samaritano se detuvo, vendó sus heridas y pagó su posada por pura compasión.",
        q: "¿Qué hizo el Buen Samaritano que demostró que tenía un gran corazón?",
        options: ["Ignoró al hombre lastimado.", "Cantó una canción de cuna.", "Se detuvo a curarlo y ayudarlo.", "Le pidió dinero al hombre lastimado."],
        a: 2
      },
      {
        icon: "🌾", title: "La Sabiduría del Espantapájaros",
        passage: "El Espantapájaros deseaba un cerebro. Dorothy le habló del Rey Salomón. Cuando Dios le dijo a Salomón que pidiera lo que quisiera, él no pidió oro ni castillos. Pidió 'sabiduría' para saber diferenciar el bien del mal y gobernar con justicia a su pueblo.",
        q: "¿Qué fue lo que pidió el Rey Salomón?",
        options: ["Mucho oro y riquezas.", "Un castillo de esmeraldas.", "Sabiduría para diferenciar el bien del mal.", "Un ejército de monos voladores."],
        a: 2
      },
      {
        icon: "🌊", title: "La Tormenta y el Camino",
        passage: "El cielo se oscureció y el viento sopló fuerte. Toto se escondió. Dorothy les recordó la historia de cuando Jesús estaba en una barca con sus amigos y hubo una gran tormenta. Los amigos gritaron asustados, pero Jesús simplemente se levantó y le ordenó al mar: '¡Calla, enmudece!', y todo quedó en completa paz.",
        q: "¿Qué le enseñó esta historia a Dorothy y sus amigos?",
        options: ["Que las tormentas son para siempre.", "Que Jesús tiene el poder de traer paz a las tormentas.", "Que debían saltar de la barca.", "Que el mar obedece a las Brujas."],
        a: 1
      },
      {
        icon: "🏠", title: "El Camino a Casa",
        passage: "Todos buscaban algo, pero Dorothy solo quería volver a casa. Leyó sobre el Hijo Pródigo, un joven que se fue lejos de su hogar y perdió todo lo que tenía. Cuando regresó arrepentido, pensó que su padre lo rechazaría, pero su padre corrió a abrazarlo e hizo una gran fiesta porque su hijo había vuelto.",
        q: "¿Cómo reaccionó el padre cuando su hijo regresó a casa?",
        options: ["Le cerró la puerta.", "Lo mandó a trabajar al bosque.", "Corrió a abrazarlo e hizo una fiesta.", "Le quitó sus zapatos mágicos."],
        a: 2
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
   MOTOR DE JUEGO DE LECTURA
   ========================================== */
class ReadingEngine {
  constructor(particleSystem) {
    this.ps = particleSystem;
    this.totalLevels = 20; // 20 lecturas para ganar
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
    const data = ReadingGenerator.generate();
    this.currentAnswer = data.a;

    document.getElementById('level-title').innerText = `${data.icon} Lectura ${this.currentLevel + 1}: ${data.title}`;
    document.getElementById('level-passage').innerText = data.passage;
    document.getElementById('level-question').innerHTML = `<span style="font-size: 14px; padding: 4px 10px; border-radius: 12px; margin-bottom: 8px; display: inline-block; border: 1px solid #dfe6e9; background: #f1f2f6; color: #2d3436;">${data.type}</span><br>${data.q}`;
    
    // Generar botones de opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    data.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.id = `opt-${index}`;
      btn.innerText = `${String.fromCharCode(65 + index)}. ${optText}`; // A, B, C, D
      btn.onclick = () => this.checkAnswer(index);
      optionsContainer.appendChild(btn);
    });

    document.getElementById('level-result').innerText = '';
    document.getElementById('next-btn').style.display = 'none';
    this.updateHUD();
  }

  checkAnswer(selectedIndex) {
    if (!this.isLevelActive) return;
    this.isLevelActive = false; // Bloquea la interacción
    
    const resultDiv = document.getElementById('level-result');
    
    // Desactivar todos los botones
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    if (selectedIndex === this.currentAnswer) {
      // Correcto
      document.getElementById(`opt-${selectedIndex}`).classList.add('correct');
      
      const baseDiff = parseInt(localStorage.getItem('oz_difficulty')) || 1;
      const earnedStars = (2 * this.combo) * baseDiff; // Da más estrellas por leer
      this.stars += earnedStars;
      this.combo++; 
      
      resultDiv.innerText = `✅ ¡Excelente comprensión! +${earnedStars} ⭐`;
      resultDiv.style.color = "#00b894";
      
      if (this.currentLevel === 0) {
        GameApp.achievements.unlock('first_reading', '📖', 'Comprendiste tu primera historia.');
      }
      if (this.currentLevel === 9) { // Nivel 10
        GameApp.achievements.unlock('reading_10', '📚', 'Leíste 10 historias maravillosas.');
      }
      
      // Partículas
      const btnRect = document.getElementById(`opt-${selectedIndex}`).getBoundingClientRect();
      this.ps.emit(btnRect.left + btnRect.width/2, btnRect.top, '#55efc4', 'star', 30);
      SoundMagic.play('correct');

    } else {
      // Incorrecto
      document.getElementById(`opt-${selectedIndex}`).classList.add('incorrect');
      document.getElementById(`opt-${this.currentAnswer}`).classList.add('correct'); // Muestra cuál era la correcta
      
      this.combo = 1;
      resultDiv.innerText = "❌ Vuelve a leer con cuidado la próxima vez.";
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
    
    localStorage.removeItem('oz_reading_save_data');
    
    setInterval(() => {
      this.ps.emit(window.innerWidth/2, window.innerHeight, '#55efc4', 'star', 15);
    }, 800);
  }
}

/* ==========================================
   INICIALIZACIÓN DEL JUEGO DE LECTURA
   ========================================== */
var GameApp = {
  particleSystem: new ParticleSystem(),
  avatarRenderer: new AvatarRenderer(),
  engine: null,

  init: function() {
    this.achievements = new AchievementSystem();

    const saved = localStorage.getItem('oz_reading_save_data'); // CLAVE DISTINTA PARA LECTURA
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
    this.engine = new ReadingEngine(this.particleSystem);
    
    if (!isNew && this.savedData) { 
      this.engine.stars = this.savedData.stars; 
      this.engine.currentLevel = this.savedData.level; 
    }
    this.engine.loadLevel();
  },
  
  saveProgress: function(level, stars) {
    const data = { base: this.avatarRenderer.base, acc: this.avatarRenderer.accessory, level: level, stars: stars };
    localStorage.setItem('oz_reading_save_data', JSON.stringify(data));
  },

  resetData: function() {
    if (confirm("¿Segura que quieres borrar tu historial de Lectura?")) {
      localStorage.removeItem('oz_reading_save_data');
      location.reload();
    }
  }
};

window.onload = () => GameApp.init();