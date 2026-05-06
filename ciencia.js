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
   GENERADOR DE NIVELES (Temáticas Específicas)
   ========================================== */
class ScienceGenerator {
  static generate(levelIndex) {
    const levels = [
      { // 1. Seres vivos
        type: 'sequence', icon: '🌱', title: 'Seres Vivos: Arma la Planta', 
        q: 'Toca las partes de la planta en orden, desde abajo (la tierra) hacia arriba:', 
        options: ['1. Raíz 🪢', '2. Tallo 🎋', '3. Hojas 🍃', '4. Flor 🌸'] 
      },
      { // 2. Seres vivos y hábitats
        type: 'quiz', icon: '🐧', title: 'Seres Vivos: Hábitats', 
        q: '¿Dónde vive el oso polar para mantenerse fresco?', 
        options: ['En el desierto 🐫', 'En la selva amazónica 🌴', 'En el hielo del Polo Norte ❄️', 'En el océano profundo 🌊'], a: 2 
      },
      { // 3. Cuerpo humano
        type: 'quiz', icon: '🧍', title: 'Cuerpo Humano: Órganos', 
        q: 'Toca tu pecho izquierdo... pum, pum. ¿Qué órgano se encarga de bombear la sangre a todo tu cuerpo?', 
        options: ['El cerebro 🧠', 'Los pulmones 🫁', 'El estómago 🍲', 'El corazón ❤️'], a: 3 
      },
      { // 4. Cuerpo humano: sentidos
        type: 'quiz', icon: '👁️', title: 'Cuerpo Humano: Sentidos', 
        q: '¿Qué sentido usas para ver los colores brillantes del arcoíris?', 
        options: ['Tacto ✋', 'Vista 👀', 'Olfato 👃', 'Oído 👂'], a: 1 
      },
      { // 5. Medio ambiente
        type: 'classify', icon: '♻️', title: 'Medio Ambiente: Reciclaje', 
        q: '¿En qué tacho debes tirar este objeto para reciclarlo?', 
        item: 'Botella de Plástico 🍼', 
        options: ['Tacho Azul (Papel) 📄', 'Tacho Blanco (Plástico) ♻️', 'Tacho Marrón (Orgánico) 🍎'], a: 1 
      },
      { // 6. Conciencia Ambiental
        type: 'true_false', icon: '🌍', title: 'Conciencia Ecológica', 
        q: 'Dejar el caño de agua abierto todo el tiempo mientras te lavas los dientes es...', 
        options: ['Malo para el planeta 💔', 'Bueno para el planeta 💚'], a: 0 
      },
      { // 7. La energía
        type: 'quiz', icon: '🌞', title: 'La Energía', 
        q: '¿Cuál es la estrella que nos da luz y calor natural todos los días?', 
        options: ['Una fogata 🔥', 'El Sol ☀️', 'Un foco eléctrico 💡', 'Una luciérnaga 🐛'], a: 1 
      },
      { // 8. Materia
        type: 'quiz', icon: '🧲', title: 'Materia y Materiales', 
        q: 'El agua que corre por los ríos y bebemos de los vasos se encuentra en estado...', 
        options: ['Sólido (duro) 🧊', 'Líquido (fluye) 💧', 'Gaseoso (humo) ☁️', 'Mágico ✨'], a: 1 
      },
      { // 9. El Clima y la Tierra
        type: 'classify', icon: '🌦️', title: 'El Clima y la Tierra', 
        q: 'Hace mucho frío y está nevando. ¿Qué ropa eliges usar?', 
        item: 'Día de Nieve ⛄', 
        options: ['Traje de baño 🩱', 'Abrigo, gorro y guantes 🧥', 'Camiseta y shorts 👕'], a: 1 
      },
      { // 10. Tecnología
        type: 'true_false', icon: '🤖', title: 'Tecnología Básica', 
        q: '¿Una computadora o teléfono es un invento tecnológico creado por los seres humanos?', 
        options: ['Sí, es tecnología 💻', 'No, es natural y crece en los árboles 🌳'], a: 0 
      }
    ];
    return levels[levelIndex % levels.length];
  }
}

/* ==========================================
   MOTOR DEL JUEGO
   ========================================== */
class ScienceEngine {
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
    const data = ScienceGenerator.generate(this.currentLevel);
    this.currentAnswer = data.a;

    document.getElementById('level-title').innerText = `${data.icon} Nivel ${this.currentLevel + 1}: ${data.title}`;
    
    const qDiv = document.getElementById('level-question');
    qDiv.innerHTML = data.q;

    // Para dinámicas que requieren mostrar un objeto clasificador enorme
    if (data.type === 'classify' && data.item) {
      qDiv.innerHTML += `<div class="classify-item">${data.item}</div>`;
    }

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // Dinámica especial: Secuencias (Tocar en orden)
    if (data.type === 'sequence') {
        this.sequenceStep = 0;
        this.sequenceTarget = data.options.length;
        
        // Mezclamos aleatoriamente las opciones
        let shuffled = data.options.map((text, index) => ({text, index})).sort(() => Math.random() - 0.5);
        
        shuffled.forEach((obj) => {
          const btn = document.createElement('button');
          btn.className = 'option-btn sequence-btn';
          btn.innerText = obj.text;
          btn.onclick = () => this.checkSequence(obj.index, btn);
          optionsContainer.appendChild(btn);
        });
    } 
    // Dinámicas normales (Clásico, Clasificar, Verdadero o Falso)
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
        this.ps.emit(rect.left + rect.width/2, rect.top, '#55efc4', 'star', 15);
        
        if (this.sequenceStep === this.sequenceTarget) {
            this.isLevelActive = false;
            const baseDiff = parseInt(localStorage.getItem('oz_difficulty')) || 1;
            const earnedStars = (2 * this.combo) * baseDiff;
            this.stars += earnedStars;
            this.combo++;
            
            resultDiv.innerText = `✅ ¡Secuencia completada! +${earnedStars} ⭐`;
            resultDiv.style.color = "#00b894";
            this.winLevelLogic();
        } else {
            resultDiv.innerText = "¡Excelente! Sigue con la siguiente parte.";
            resultDiv.style.color = "#f6e58d";
            SoundMagic.play('correct');
        }
    } else {
        // Click incorrecto, resetea la secuencia visual
        btnElement.classList.add('incorrect');
        setTimeout(() => btnElement.classList.remove('incorrect'), 500);
        
        this.combo = 1;
        this.sequenceStep = 0;
        resultDiv.innerText = "❌ Orden incorrecto. ¡Vuelve a empezar desde el paso 1!";
        resultDiv.style.color = "#d63031";
        SoundMagic.play('incorrect');
        this.updateHUD();
        
        // Rehabilitar botones de secuencia
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
      
      resultDiv.innerText = `✅ ¡Investigación correcta! +${earnedStars} ⭐`;
      resultDiv.style.color = "#00b894";
      
      const btnRect = document.getElementById(`opt-${selectedIndex}`).getBoundingClientRect();
      this.ps.emit(btnRect.left + btnRect.width/2, btnRect.top, '#55efc4', 'star', 30);
      this.winLevelLogic();
      SoundMagic.play('correct');
    } else {
      document.getElementById(`opt-${selectedIndex}`).classList.add('incorrect');
      document.getElementById(`opt-${this.currentAnswer}`).classList.add('correct'); 
      
      this.combo = 1;
      resultDiv.innerText = "❌ Observa bien los datos para la próxima.";
      resultDiv.style.color = "#d63031";
      SoundMagic.play('incorrect');
      
      this.updateHUD();
      GameApp.saveProgress(this.currentLevel + 1, this.stars);
      document.getElementById('next-btn').style.display = 'block';
    }
  }

  winLevelLogic() {
      if (this.currentLevel === 0) GameApp.achievements.unlock('first_science', '🔬', 'Descubriste tu primer secreto científico.');
      if (this.currentLevel === 9) GameApp.achievements.unlock('science_10', '🧬', 'Completaste todos los experimentos de Ciencia.');
      
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
    localStorage.removeItem('oz_ciencia_save_data');
    setInterval(() => this.ps.emit(window.innerWidth/2, window.innerHeight, '#00b894', 'star', 15), 800);
  }
}

/* ==========================================
   INICIALIZACIÓN DEL JUEGO
   ========================================== */
var GameApp = {
  particleSystem: new ParticleSystem(), avatarRenderer: new AvatarRenderer(), engine: null,
  init: function() {
    this.achievements = new AchievementSystem();
    const saved = localStorage.getItem('oz_ciencia_save_data');
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
    this.engine = new ScienceEngine(this.particleSystem);
    if (!isNew && this.savedData) { this.engine.stars = this.savedData.stars; this.engine.currentLevel = this.savedData.level; }
    this.engine.loadLevel();
  },
  saveProgress: function(level, stars) {
    localStorage.setItem('oz_ciencia_save_data', JSON.stringify({ base: this.avatarRenderer.base, acc: this.avatarRenderer.accessory, level: level, stars: stars }));
  },
  resetData: function() { if (confirm("¿Borrar tu historial del Laboratorio?")) { localStorage.removeItem('oz_ciencia_save_data'); location.reload(); } }
};
window.onload = () => GameApp.init();