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
   MOTOR DE JUEGO DE MEMORIA
   ========================================== */
class MemoryEngine {
  constructor(particleSystem) {
    this.ps = particleSystem;
    this.totalLevels = 10;
    this.emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🦄", "🐝", "🦋", "🐢", "🐙"];
    this.reset();
  }

  reset() {
    this.stars = 0;
    this.combo = 1;
    this.currentLevel = 0;
    this.isLevelActive = false;
    this.flippedCards = [];
    this.matches = 0;
  }

  updateHUD() {
    document.getElementById('hud-stars').innerText = `⭐ ${this.stars}`;
    document.getElementById('hud-combo').innerText = `🔥 x${this.combo}`;
    const progress = (this.currentLevel / this.totalLevels) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
  }

  loadLevel() {
    this.isLevelActive = true;
    this.flippedCards = [];
    this.matches = 0;

    const baseDiff = parseInt(localStorage.getItem('oz_difficulty')) || 1;
    let pairsCount = (baseDiff * 2) + this.currentLevel; // Fácil=2, Medio=4, Difícil=6 pares iniciales
    if (pairsCount > 15) pairsCount = 15;
    this.pairsToWin = pairsCount;

    let selectedEmojis = [];
    let tempEmojis = [...this.emojis].sort(() => Math.random() - 0.5);
    for(let i=0; i<pairsCount; i++) {
        selectedEmojis.push(tempEmojis[i]);
        selectedEmojis.push(tempEmojis[i]);
    }
    selectedEmojis.sort(() => Math.random() - 0.5);

    let cols = 2;
    const isMobile = window.innerWidth <= 480;
    if (selectedEmojis.length >= 24) cols = isMobile ? 4 : 6;
    else if (selectedEmojis.length >= 16) cols = 4;
    else if (selectedEmojis.length >= 12) cols = isMobile ? 3 : 4;
    else if (selectedEmojis.length >= 6) cols = isMobile ? 3 : 4;

    const grid = document.getElementById('memory-grid');
    grid.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    grid.innerHTML = '';

    selectedEmojis.forEach((emoji, index) => {
        let card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        
        let inner = document.createElement('div');
        inner.className = 'inner';
        
        let front = document.createElement('div');
        front.className = 'front';
        
        let back = document.createElement('div');
        back.className = 'back';
        back.innerText = emoji;

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        card.onclick = () => this.flipCard(card);
        grid.appendChild(card);
    });

    document.getElementById('level-title').innerText = `🧠 Nivel ${this.currentLevel + 1}`;
    document.getElementById('level-result').innerText = '';
    document.getElementById('next-btn').style.display = 'none';
    this.updateHUD();
  }

  flipCard(card) {
      if (!this.isLevelActive) return;
      if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
      if (this.flippedCards.length >= 2) return;

      card.classList.add('flipped');
      this.flippedCards.push(card);

      if (this.flippedCards.length === 2) {
          this.checkMatch();
      }
  }

  checkMatch() {
      let card1 = this.flippedCards[0];
      let card2 = this.flippedCards[1];

      if (card1.dataset.emoji === card2.dataset.emoji) {
          setTimeout(() => {
              card1.classList.add('matched');
              card2.classList.add('matched');
              this.flippedCards = [];
              this.matches++;
              
              const baseDiff = parseInt(localStorage.getItem('oz_difficulty')) || 1;
              const earnedStars = (2 * this.combo) * baseDiff;
              this.stars += earnedStars;
              this.combo++;
              this.updateHUD();

              // Logros
              if (this.matches === 1 && this.currentLevel === 0) {
                GameApp.achievements.unlock('first_match', '🧠', 'Encontraste tu primera pareja.');
              }

              const rect = card2.getBoundingClientRect();
              this.ps.emit(rect.left + rect.width/2, rect.top, '#55efc4', 'star', 20);

              if (this.matches === this.pairsToWin) {
                  this.winLevel();
              }
          SoundMagic.play('correct');
          }, 500);
      } else {
          setTimeout(() => {
              card1.classList.remove('flipped');
              card2.classList.remove('flipped');
              this.flippedCards = [];
              this.combo = 1;
              this.updateHUD();
          SoundMagic.play('incorrect');
          }, 1000);
      }
  }

  winLevel() {
      this.isLevelActive = false;
      const resultDiv = document.getElementById('level-result');
      resultDiv.innerText = `✅ ¡Memoria excelente!`;
      resultDiv.style.color = "#00b894";
      document.getElementById('next-btn').style.display = 'block';
      GameApp.saveProgress(this.currentLevel + 1, this.stars);
      
      if (this.currentLevel === 9) { // Nivel 10
        GameApp.achievements.unlock('memoria_10', '🏅', 'Completaste 10 niveles de memoria.');
      }
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
    localStorage.removeItem('oz_memoria_save_data');
    
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

    const saved = localStorage.getItem('oz_memoria_save_data');
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
    this.engine = new MemoryEngine(this.particleSystem);
    
    if (!isNew && this.savedData) { 
      this.engine.stars = this.savedData.stars; 
      this.engine.currentLevel = this.savedData.level; 
    }
    this.engine.loadLevel();
  },
  
  saveProgress: function(level, stars) {
    const data = { base: this.avatarRenderer.base, acc: this.avatarRenderer.accessory, level: level, stars: stars };
    localStorage.setItem('oz_memoria_save_data', JSON.stringify(data));
  },

  resetData: function() {
    if (confirm("¿Estás seguro que deseas reiniciar tu progreso en memoria?")) {
      localStorage.removeItem('oz_memoria_save_data');
      location.reload();
    }
  }
};

window.onload = () => GameApp.init();