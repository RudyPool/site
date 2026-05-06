/* ==========================================
   SISTEMA 1: MOTOR DE PARTÍCULAS (MAGIA VISUAL)
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

/* ==========================================
   SISTEMA 2: COMPOSICIÓN DE AVATARES (LAYERING)
   ========================================== */
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
   SISTEMA 3: GENERADOR DE NIVELES MATEMÁTICOS
   ========================================== */
class LevelGenerator {
  static generate(levelIndex) {
    const baseDiff = parseInt(localStorage.getItem('oz_difficulty')) || 1;
    const diff = baseDiff + Math.floor(levelIndex / 10); 
    const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const templates = [
      () => { let a=r(5,15)*diff, b=r(2,10)*diff; return { icon: "🧱", title: "Camino Amarillo", q: `Dorothy dio ${a} pasos y luego saltó ${b} pasos más. ¿Cuántos pasos avanzó?`, a: a+b }; },
      () => { let a=r(10,25)*diff, b=r(1,9)*diff; return { icon: "🌲", title: "Bosque Oscuro", q: `El León recogió ${a} manzanas, pero se comió ${b}. ¿Cuántas le quedan?`, a: a-b }; },
      () => { let a=r(2,5)*diff, b=r(2,5); return { icon: "🌺", title: "Campo de Amapolas", q: `Ves ${a} filas de amapolas. Si cada fila tiene ${b} flores, ¿cuántas hay en total?`, a: a*b }; },
      () => { let a=r(2,5)*diff, b=r(2,4); return { icon: "🛢️", title: "Corazón de Hojalata", q: `Serie del corazón: ${a} → ${a+b} → ${a+b*2} → ${a+b*3} → ? (¿Qué sigue?)`, a: a+b*4 }; },
      () => { let a=(r(5,15)*diff)*2; return { icon: "💎", title: "Ciudad Esmeralda", q: `El guardia pide la mitad de tus ${a} esmeraldas. ¿Cuántas le das?`, a: a/2 }; },
      () => { let a=r(10,20)*diff, b=r(3,8)*diff, c=r(2,6)*diff; return { icon: "🐒", title: "Monos Voladores", q: `Tienes ${a} estrellas. Encuentras ${b}, pero un mono te quita ${c}. ¿Cuántas quedan?`, a: a+b-c }; },
      () => { let a=r(30,50)*diff, b=r(30,50)*diff; if(a===b) b++; return { icon: "🧹", title: "Desafío de la Bruja", q: `La Bruja te reta: Elige el número MAYOR: ¿${a} o ${b}?`, a: Math.max(a,b) }; },
      () => { let a=r(5,10)*diff, b=r(5,10)*diff, c=r(5,10)*diff; return { icon: "🐶", title: "Huesos de Toto", q: `Toto encontró ${a} huesos, luego ${b} y finalmente ${c}. ¿Cuántos tiene en total?`, a: a+b+c }; },
      () => { let a=r(3,7)*diff, b=r(3,7)*diff; return { icon: "🌪️", title: "Vueltas del Tornado", q: `El tornado da ${a} vueltas por minuto. En ${b} minutos, ¿cuántas vueltas dio?`, a: a*b }; },
      () => { let a=r(20,40)*diff, b=r(10,19)*diff; return { icon: "🐦", title: "Espantapájaros", q: `Había ${a} cuervos en el maíz. El Espantapájaros asustó a ${b}. ¿Cuántos quedaron?`, a: a-b }; },
      () => { let a=r(1,5)*diff; return { icon: "👠", title: "Zapatos Mágicos", q: `Si chocas los talones 3 veces para hacer magia, y haces este truco ${a} veces, ¿cuántos choques diste en total?`, a: a*3 }; },
      () => { let a=r(2,6)*diff, b=r(10,20); return { icon: "🎈", title: "Globo del Mago", q: `El globo sube ${b} metros cada segundo. ¿A qué altura estará en ${a} segundos?`, a: a*b }; },
      () => { let a=r(50,100)*diff, b=r(10,40)*diff; return { icon: "🏰", title: "Castillo de Glinda", q: `El castillo tiene ${a} escalones. Ya subiste ${b}. ¿Cuántos faltan?`, a: a-b }; },
      () => { let a=r(1,5), b=r(1,6); return { icon: "⏳", title: "Reloj de Arena", q: `Son las ${a} de la tarde. Si el viaje toma ${b} horas, ¿qué hora será? (Solo el número)`, a: a+b }; },
      () => { let a=r(3,8)*diff, b=r(2,5)*diff; return { icon: "🧪", title: "Poción Mágica", q: `Necesitas ${a} gotas verdes y ${b} gotas azules. ¿Cuántas gotas usas en total?`, a: a+b }; },
      () => { let a=(r(5,25)*diff)*2; return { icon: "🧙‍♀️", title: "Sombreros de Munchkins", q: `Había ${a} Munchkins. La mitad llevaba sombrero. ¿Cuántos tenían sombrero?`, a: a/2 }; },
      () => { let a=r(2,5)*diff; return { icon: "🪄", title: "Varita de Glinda", q: `Glinda agitó su varita ${a} veces. Cada vez salieron 10 chispas. ¿Cuántas chispas hay?`, a: a*10 }; },
      () => { let a=r(20,50)*diff, b=r(5,15)*diff, c=r(1,5)*diff; return { icon: "🦁", title: "Valor del León", q: `El León tiene ${a} puntos de valor, pierde ${b} por un susto, pero recupera ${c}. ¿Cuánto valor le queda?`, a: a-b+c }; },
      () => { let a=r(3,6)*diff, b=r(2,4)*diff; return { icon: "🌻", title: "Jardín Mágico", q: `Plantas ${a} semillas y cada una da ${b} flores. ¿Cuántas flores crecieron en total?`, a: a*b }; },
      () => { let a=r(10,30)*diff, b=r(5,15)*diff; return { icon: "🛤️", title: "Ladrillos Amarillos", q: `Dorothy pintó ${a} ladrillos hoy y ${b} ayer. ¿Cuántos pintó en los dos días?`, a: a+b }; },
      () => { let a=r(20,50)*diff, b=r(2,5); return { icon: "🏰", title: "Escalones del Castillo", q: `Bajas los escalones: ${a} → ${a-b} → ${a-b*2} → ${a-b*3} → ? (¿Qué número sigue?)`, a: a-b*4 }; },
      () => { let a=r(1,4)*diff; return { icon: "✨", title: "Magia Multiplicadora", q: `La luz crece el doble cada vez: ${a} → ${a*2} → ${a*4} → ${a*8} → ?`, a: a*16 }; },
      () => { let a=r(5,15)*diff, b=r(2,6); return { icon: "🌉", title: "El Puente Roto", q: `Falta un ladrillo en el puente: ${a} → ${a+b} → ? → ${a+b*3}. ¿Qué número falta?`, a: a+b*2 }; },
      () => { let a=r(2,10)*diff; return { icon: "🦁", title: "Saltos del León", q: `El León salta cada vez más lejos: ${a} → ${a+1} → ${a+3} → ${a+6} → ? (Pista: suma +1, +2, +3, +4...)`, a: a+10 }; },
      
      // DINÁMICA: COLOREA EL RESULTADO 🎨
      () => { 
        let a = r(5,10)*diff, b = r(2,5)*diff; 
        let ans = a+b; 
        return { 
          type: "color", icon: "🎨", title: "Colorea el Resultado", q: `¡Pinta el muro de la Ciudad Esmeralda!\nResuelve ${a} + ${b} para elegir el color correcto.`, a: ans, 
          options: [
            {text: "Rojo 🔴", val: ans, color: "#ff7979"}, {text: "Azul 🔵", val: ans + 2, color: "#686de0"}, {text: "Verde 🟢", val: ans - 2, color: "#badc58"}
          ].sort(() => Math.random() - 0.5) 
        }; 
      },
      () => { 
        let a = r(10,20)*diff, b = r(5,10)*diff; 
        let ans = a-b; 
        return { 
          type: "color", icon: "🎨", title: "Pincel Mágico", q: `El espantapájaros quiere pintar su granero.\nResuelve ${a} - ${b}.`, a: ans, 
          options: [
            {text: "Amarillo 🟡", val: ans, color: "#f9ca24"}, {text: "Morado 🟣", val: ans + 3, color: "#be2edd"}, {text: "Naranja 🟠", val: Math.max(1, ans - 2), color: "#f0932b"}
          ].sort(() => Math.random() - 0.5) 
        }; 
      },
      () => { 
        let a = r(2,6), b = r(2,5); 
        let ans = a*b; 
        return { 
          type: "color", icon: "🎨", title: "Magia de Colores", q: `Toto encontró latas de pintura.\n¿Qué color usamos si la clave es ${a} x ${b}?`, a: ans, 
          options: [
            {text: "Celeste 💧", val: ans, color: "#7ed6df"}, {text: "Rosado 🌸", val: ans + 1, color: "#ff9ff3"}, {text: "Gris ⚪", val: ans + 2, color: "#8395a7"}
          ].sort(() => Math.random() - 0.5) 
        }; 
      },
      
      // DINÁMICA 1: LA CARRERA DE NÚMEROS 🎲
      () => { 
        let s1 = { a: r(5,10)*diff, b: r(2,5)*diff, op: '+' }; s1.ans = s1.a + s1.b;
        let s2 = { a: r(10,20)*diff, b: r(2,9)*diff, op: '-' }; s2.ans = s2.a - s2.b;
        let s3 = { a: r(2,5), b: r(2,5), op: 'x' }; s3.ans = s3.a * s3.b;
        return { 
          type: "race", icon: "🎲", title: "Carrera de Números", q: "¡Avanza por el camino resolviendo las operaciones!",
          steps: [
            { text: `${s1.a} + ${s1.b}`, a: s1.ans }, { text: `${s2.a} - ${s2.b}`, a: s2.ans }, { text: `${s3.a} × ${s3.b}`, a: s3.ans }
          ]
        }; 
      },
      
      // DINÁMICA 2: DETECTIVE DE NÚMEROS 🕵️‍♂️ (Suma)
      () => {
        let start = r(2, 10) * diff, step = r(2, 5) * diff;
        let seq = [start, start + step, start + step*2, start + step*3, start + step*4];
        let hideIdx = r(1, 3);
        let ans = seq[hideIdx];
        seq[hideIdx] = '?';
        return { type: "detective", icon: "🕵️‍♂️", title: "Detective de Números", q: "Descubre el patrón y encuentra el número secreto:", a: ans, sequence: seq };
      },
      // DINÁMICA 2: DETECTIVE DE NÚMEROS 🕵️‍♂️ (Resta)
      () => {
        let start = r(20, 50) * diff, step = r(2, 10);
        let seq = [start, start - step, start - step*2, start - step*3, start - step*4];
        let hideIdx = r(1, 3);
        let ans = seq[hideIdx];
        seq[hideIdx] = '?';
        return { type: "detective", icon: "🕵️‍♂️", title: "Detective de Números", q: "Descubre el patrón oculto y encuentra el número:", a: ans, sequence: seq };
      }
    ];

    const templateIndex = Math.floor(Math.random() * templates.length);
    return templates[templateIndex]();
  }
}

/* DICCIONARIO DE ENTORNOS VISUALES */
const THEMES = {
  "🧱": "linear-gradient(135deg, #f6e58d 0%, #f0932b 100%)", // Camino Amarillo
  "🌲": "linear-gradient(135deg, #079992 0%, #052c22 100%)", // Bosque
  "💎": "linear-gradient(135deg, #55efc4 0%, #00b894 100%)", // Ciudad Esmeralda
  "🧹": "linear-gradient(135deg, #4a69bd 0%, #0c2461 100%)", // Bruja (Oscuro)
  "🌪️": "linear-gradient(135deg, #535c68 0%, #2f3640 100%)", // Tornado (Gris)
  "🏰": "linear-gradient(135deg, #ff7979 0%, #eb4d4b 100%)", // Castillo
  "🌺": "linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)", // Amapolas (Rosa)
  "🌉": "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)", // Puente (Morado)
  "🦁": "linear-gradient(135deg, #ffb142 0%, #cc8e35 100%)", // León (Naranja)
  "✨": "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)", // Magia (Dorado)
  "🎨": "linear-gradient(135deg, #ff9ff3 0%, #feca57 50%, #48dbfb 100%)", // Arte/Colores
  "🎲": "linear-gradient(135deg, #ff9ff3 0%, #feca57 50%, #ff6b6b 100%)", // Carrera
  "🕵️‍♂️": "linear-gradient(135deg, #1e272e 0%, #485460 100%)", // Detective
  "default": "linear-gradient(135deg, #82ccdd 0%, #60a3bc 100%)"
};

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
   SISTEMA 4: MOTOR DE ESTADO Y FLUJO DEL JUEGO
   ========================================== */
class GameEngine {
  constructor(particleSystem) {
    this.ps = particleSystem;
    this.totalLevels = 100;
    this.reset();
    
    this.frases = [
      "¡No hay lugar como el hogar! 👠", "¡Eres muy valiente! 🦁", 
      "¡Tienes un gran cerebro! 🧠", "¡Tu corazón es enorme! ❤️"
    ];

    document.getElementById('player-answer').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.checkAnswer();
    });
  }

  reset() {
    this.stars = 0;
    this.combo = 1;
    this.currentLevel = 0;
    this.currentAnswer = 0;
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
    const data = LevelGenerator.generate(this.currentLevel);
    this.currentLevelData = data;
    this.currentAnswer = data.a;

    document.getElementById('level-title').innerText = `${data.icon} Misión ${this.currentLevel + 1}: ${data.title}`;
    document.getElementById('level-question').innerText = data.q;
    
    const input = document.getElementById('player-answer');
    const btn = document.getElementById('submit-btn');

    // Limpiamos la paleta de colores si existía en el nivel anterior
    const oldPalette = document.getElementById('color-palette');
    if (oldPalette) oldPalette.remove();
    const oldRace = document.getElementById('race-board');
    if (oldRace) oldRace.remove();
    const oldDet = document.getElementById('detective-board');
    if (oldDet) oldDet.remove();

    if (data.type === 'race') {
      input.style.display = 'block'; btn.style.display = 'block';
      this.raceStep = 0;
      this.currentAnswer = data.steps[0].a;
      
      const raceBoard = document.createElement('div');
      raceBoard.id = 'race-board'; raceBoard.className = 'race-board';
      data.steps.forEach((step, idx) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'race-step';
        stepDiv.style.background = idx === 0 ? '#f6e58d' : 'rgba(255,255,255,0.2)';
        stepDiv.style.color = idx === 0 ? '#2d3436' : '#fff';
        stepDiv.innerText = step.text; stepDiv.id = `race-step-${idx}`;
        raceBoard.appendChild(stepDiv);
        if (idx < data.steps.length - 1) {
          const arrow = document.createElement('span'); arrow.innerText = '➡️'; raceBoard.appendChild(arrow);
        }
      });
      const flag = document.createElement('span'); flag.innerText = '🏁'; flag.style.fontSize = '24px';
      raceBoard.appendChild(flag);
      document.getElementById('level-question').after(raceBoard);
      
      input.value = ''; input.disabled = false; input.focus();
      btn.innerText = 'Avanzar 🏃'; btn.disabled = false; btn.onclick = () => this.checkAnswer();
      
    } else if (data.type === 'detective') {
      input.style.display = 'block'; btn.style.display = 'block';
      const detBoard = document.createElement('div');
      detBoard.id = 'detective-board'; detBoard.className = 'detective-board';
      data.sequence.forEach(num => {
        const block = document.createElement('div'); block.className = 'detective-block';
        block.style.background = num === '?' ? '#ff7979' : 'rgba(255,255,255,0.2)';
        block.style.border = num === '?' ? '3px dashed #fff' : '2px solid rgba(255,255,255,0.4)';
        block.innerText = num; detBoard.appendChild(block);
      });
      document.getElementById('level-question').after(detBoard);
      
      input.value = ''; input.disabled = false; input.focus();
      btn.innerText = 'Descubrir 🔍'; btn.disabled = false; btn.onclick = () => this.checkAnswer();
      
    } else if (data.type === 'color') {
      input.style.display = 'none';
      btn.style.display = 'none';

      const palette = document.createElement('div');
      palette.id = 'color-palette';
      palette.style.display = 'flex';
      palette.style.flexWrap = 'wrap';
      palette.style.gap = '10px';
      palette.style.justifyContent = 'center';
      palette.style.marginTop = '15px';

      data.options.forEach(opt => {
        const cBtn = document.createElement('button');
        cBtn.innerText = `${opt.val} = ${opt.text}`;
        cBtn.style.background = opt.color;
        cBtn.style.margin = '0';
        cBtn.style.flex = '1';
        cBtn.style.minWidth = '110px';
        cBtn.style.border = '3px solid rgba(255,255,255,0.4)';
        cBtn.style.color = '#fff';
        cBtn.style.textShadow = '1px 1px 3px rgba(0,0,0,0.8)';
        cBtn.onclick = () => {
          input.value = opt.val;
          this.checkAnswer();
        };
        palette.appendChild(cBtn);
      });

      document.getElementById('level-question').after(palette);
    } else {
      input.style.display = 'block';
      btn.style.display = 'block';
      input.value = '';
      input.disabled = false;
      input.focus();
      btn.innerText = 'Usar Magia 🪄';
      btn.disabled = false;
      btn.onclick = () => this.checkAnswer();
    }

    // Aplicar Entorno Visual (Fondo Dinámico)
    const bg = THEMES[data.icon] || THEMES["default"];
    const pattern = `url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="%23000" opacity="0.1"/><circle cx="50" cy="50" r="40" fill="%23fff" opacity="0.05"/></svg>')`;
    document.body.style.backgroundImage = `${pattern}, ${bg}`;

    document.getElementById('level-result').innerText = '';
    document.getElementById('motivation').innerText = this.frases[Math.floor(Math.random() * this.frases.length)];
    this.updateHUD();
  }

  checkAnswer() {
    if (!this.isLevelActive) return;
    
    const input = document.getElementById('player-answer');
    const val = parseInt(input.value);
    const resultDiv = document.getElementById('level-result');
    const card = document.getElementById('game-card');

    if (isNaN(val)) {
      resultDiv.innerText = "✍️ Escribe un número mágico";
      resultDiv.style.color = "#ffbe76";
      return;
    }

    // Manejo de Carrera
    if (this.currentLevelData && this.currentLevelData.type === 'race') {
      if (val === this.currentAnswer) {
        const oldStep = document.getElementById(`race-step-${this.raceStep}`);
        oldStep.style.background = '#55efc4';
        oldStep.style.color = '#052c22';
        oldStep.innerText = '✅';

        this.raceStep++;
        if (this.raceStep < this.currentLevelData.steps.length) {
          this.currentAnswer = this.currentLevelData.steps[this.raceStep].a;
          const nextStep = document.getElementById(`race-step-${this.raceStep}`);
          nextStep.style.background = '#f6e58d';
          nextStep.style.color = '#2d3436';
          input.value = '';
          input.focus();
          
          const rect = nextStep.getBoundingClientRect();
          this.ps.emit(rect.left + rect.width/2, rect.top, '#f6e58d', 'star', 15);
          
          resultDiv.innerText = "¡Sigue avanzando! 🏃";
          resultDiv.style.color = "#f6e58d";
          SoundMagic.play('correct');
          return;
        } else {
           this.handleWin(resultDiv, input);
           return;
        }
      } else {
        this.handleLoss(resultDiv, input, card);
        return;
      }
    }

    if (val === this.currentAnswer) {
      this.handleWin(resultDiv, input);
    } else {
      this.handleLoss(resultDiv, input, card);
    }
  }

  handleWin(resultDiv, input) {
    this.isLevelActive = false;
    input.disabled = true;
    
    // Deshabilitar la paleta visualmente
    const palette = document.getElementById('color-palette');
    if (palette) {
      palette.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.6';
        b.style.transform = 'none';
      });
    }
    
    // Rellenar visualmente el tablero detective
    if (this.currentLevelData && this.currentLevelData.type === 'detective') {
      const detBoard = document.getElementById('detective-board');
      if (detBoard) {
        detBoard.childNodes.forEach(child => {
          if (child.innerText === '?') {
            child.innerText = this.currentAnswer;
            child.style.background = '#55efc4'; child.style.border = '2px solid #00b894'; child.style.color = '#052c22';
          }
        });
      }
    }

    const baseDiff = parseInt(localStorage.getItem('oz_difficulty')) || 1;
    const earnedStars = (1 * this.combo) * baseDiff;
    this.stars += earnedStars;
    this.combo++; 
    
    // --- EVALUAR LOGROS MATEMÁTICOS ---
    if (this.currentLevel === 0) {
      GameApp.achievements.unlock('first_math', '🌟', 'Resolviste tu primera misión matemática.');
    }
    if (this.currentLevel === 9) { // Nivel 10
      GameApp.achievements.unlock('mission_10', '🏅', 'Llegaste a la misión 10.');
    }
    if (this.combo === 6) { // Como acabamos de sumar 1, el combo era 5 al acertar
      GameApp.achievements.unlock('combo_5', '🔥', '¡Racha de 5 respuestas correctas!');
    }
    if (this.currentLevelData && this.currentLevelData.type === 'color') {
      GameApp.achievements.unlock('first_color', '🎨', 'Encontraste tu primer color mágico.');
    }
    if (this.currentLevelData && this.currentLevelData.type === 'race') {
      GameApp.achievements.unlock('first_race', '🎲', 'Terminaste tu primera carrera.');
    }
    if (this.currentLevelData && this.currentLevelData.type === 'detective') {
      GameApp.achievements.unlock('first_detective', '🕵️‍♂️', 'Resolviste tu primer misterio.');
    }
    
    resultDiv.innerText = `✅ ¡Correcto! +${earnedStars} ⭐`;
    resultDiv.style.color = "#55efc4";
    this.updateHUD();
    SoundMagic.play('correct');
    
    // Guardar progreso automáticamente
    GameApp.saveProgress(this.currentLevel + 1, this.stars);

    let px, py;
    if (input.style.display === 'none') {
      const cardRect = document.getElementById('game-card').getBoundingClientRect();
      px = cardRect.left + cardRect.width/2;
      py = cardRect.top + cardRect.height/2;
    } else {
      const rect = input.getBoundingClientRect();
      px = rect.left + rect.width/2;
      py = rect.top;
    }
    this.ps.emit(px, py, '#f6e58d', 'star', 40);

    const btn = document.getElementById('submit-btn');
    btn.style.display = 'block'; // Asegurar que sea visible si estaba oculto en modo Color
    btn.innerText = "Avanzar ➡️";
    btn.disabled = false;
    btn.onclick = () => this.nextLevel();
  }

  handleLoss(resultDiv, input, card) {
    this.combo = 1; 
    this.updateHUD();
    
    resultDiv.innerText = "❌ Uh oh, intenta otra vez.";
    resultDiv.style.color = "#ff7979";
    SoundMagic.play('incorrect');
    
    card.classList.remove('shake');
    void card.offsetWidth; 
    card.classList.add('shake');
    
    input.value = '';
    if (!this.currentLevelData || this.currentLevelData.type !== 'color') {
      input.focus();
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
    
    // Borrar guardado al terminar el juego
    localStorage.removeItem('oz_save_data');
    
    setInterval(() => {
      this.ps.emit(window.innerWidth/2, window.innerHeight, '#f6e58d', 'star', 15);
      this.ps.emit(window.innerWidth/2, window.innerHeight, '#55efc4', 'sparkle', 15);
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

    // Revisar si existe una partida guardada
    const saved = localStorage.getItem('oz_save_data');
    if (saved) {
      const data = JSON.parse(saved);
      this.avatarRenderer.setBase(data.base);
      if (data.acc) this.avatarRenderer.setAccessory(data.acc);

      const btn = document.getElementById('continue-btn');
      btn.style.display = 'block';
      btn.innerText = `Continuar Misión ${data.level + 1} ➡️`;
      
      const resetBtn = document.getElementById('reset-btn');
      if (resetBtn) resetBtn.style.display = 'block';
      
      this.savedData = data;
    }

    // Llamar al contador de visitas global
    this.fetchVisitorCount();
  },

  startGame: function(isNew = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active');
    
    this.avatarRenderer.cloneTo('hud-avatar');
    
    this.engine = new GameEngine(this.particleSystem);
    
    // Cargar datos si no es partida nueva
    if (!isNew && this.savedData) {
      this.engine.stars = this.savedData.stars;
      this.engine.currentLevel = this.savedData.level;
    }
    
    this.engine.loadLevel();
  },
  
  saveProgress: function(level, stars) {
    const data = {
      base: this.avatarRenderer.base,
      acc: this.avatarRenderer.accessory,
      level: level,
      stars: stars
    };
    localStorage.setItem('oz_save_data', JSON.stringify(data));
  },

  resetData: function() {
    if (confirm("¿Estás segura de que quieres borrar todo tu historial y empezar de nuevo como otro jugador?")) {
      localStorage.removeItem('oz_save_data');
      location.reload();
    }
  },

  fetchVisitorCount: async function() {
    try {
      // Usamos una API REST gratuita para contar visitas globales
      // 'matematicas-dorothy' es tu espacio único en su base de datos
      const response = await fetch('https://api.counterapi.dev/v1/matematicas-dorothy/visits/up');
      const data = await response.json();
      const counterEl = document.getElementById('global-visitor-count');
      if (counterEl) counterEl.innerText = data.count;
    } catch (error) {
      console.warn("No se pudo conectar al servidor de visitas.");
      const counterEl = document.getElementById('global-visitor-count');
      if (counterEl) counterEl.innerText = "Desconocido";
    }
  }
};

// Arrancar la revisión de guardado cuando carga la página
window.onload = () => GameApp.init();