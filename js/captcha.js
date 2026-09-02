/**
 * Advanced Visual HTML5 Canvas Captcha Engine
 * Case-Insensitive Verification for PDF CV Download
 */

class CaptchaEngine {
  constructor() {
    this.canvas = document.getElementById('captchaCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.input = document.getElementById('captchaInput');
    this.verifyBtn = document.getElementById('captchaVerifyBtn');
    this.refreshBtn = document.getElementById('captchaRefreshBtn');
    this.audioBtn = document.getElementById('captchaAudioBtn');
    this.errorMsg = document.getElementById('captchaError');
    this.successMsg = document.getElementById('captchaSuccess');
    this.modal = document.getElementById('captchaModal');
    this.closeBtn = document.getElementById('captchaCloseBtn');
    this.cancelBtn = document.getElementById('captchaCancelBtn');
    this.currentCode = '';
    this.length = 6;
    
    // Distinct character set (letters + numbers)
    this.charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';

    this.init();
  }

  init() {
    if (!this.canvas || !this.ctx) return;

    // Event Listeners
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.generateCaptcha();
        this.animateButton(this.refreshBtn);
      });
    }

    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.speakCode();
      });
    }

    if (this.verifyBtn) {
      this.verifyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.validate();
      });
    }

    if (this.input) {
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.validate();
        }
      });
    }

    // Modal Triggers
    const triggerButtons = document.querySelectorAll('.trigger-cv-download');
    triggerButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => this.closeModal());
    }

    // Close on backdrop click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    // Initial generation
    this.generateCaptcha();
  }

  openModal() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.resetState();
    this.generateCaptcha();
    setTimeout(() => {
      if (this.input) this.input.focus();
    }, 150);
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.resetState();
  }

  resetState() {
    if (this.input) {
      this.input.value = '';
      this.input.classList.remove('error', 'shake');
    }
    if (this.errorMsg) {
      this.errorMsg.style.display = 'none';
      this.errorMsg.textContent = '';
    }
    if (this.successMsg) {
      this.successMsg.style.display = 'none';
      this.successMsg.textContent = '';
    }
  }

  generateCaptcha() {
    let result = '';
    for (let i = 0; i < this.length; i++) {
      const randomIndex = Math.floor(Math.random() * this.charset.length);
      result += this.charset.charAt(randomIndex);
    }
    this.currentCode = result;
    this.renderCanvas();
    if (this.input) this.input.value = '';
    if (this.errorMsg) this.errorMsg.style.display = 'none';
  }

  renderCanvas() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Background styling
    ctx.clearRect(0, 0, width, height);
    
    // Determine theme mode
    const isDark = document.body.classList.contains('dark-theme');
    
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (isDark) {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e293b');
      bgGrad.addColorStop(1, '#0f172a');
    } else {
      bgGrad.addColorStop(0, '#f1f5f9');
      bgGrad.addColorStop(0.5, '#e2e8f0');
      bgGrad.addColorStop(1, '#f8fafc');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Add Security Noise Grid / Mesh
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Add Distorted Noise Lines
    const lineColors = isDark 
      ? ['rgba(56, 189, 248, 0.4)', 'rgba(244, 63, 94, 0.4)', 'rgba(52, 211, 153, 0.4)', 'rgba(250, 204, 21, 0.4)']
      : ['rgba(2, 132, 199, 0.4)', 'rgba(225, 29, 72, 0.4)', 'rgba(5, 150, 105, 0.4)', 'rgba(217, 119, 6, 0.4)'];
      
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = lineColors[i % lineColors.length];
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width * 0.5, Math.random() * height,
        Math.random() * width * 0.8, Math.random() * height,
        width - Math.random() * 20, Math.random() * height
      );
      ctx.stroke();
    }

    // Add Noise Dots / Specks
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, ' + (Math.random() * 0.25) + ')' : 'rgba(0, 0, 0, ' + (Math.random() * 0.2) + ')';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render characters with distortion, random font sizes, rotations, and executive colors
    const charList = this.currentCode.split('');
    const charWidth = (width - 40) / this.length;
    const fonts = ['Courier New', 'Verdana', 'Trebuchet MS', 'Arial', 'Georgia'];
    
    const textColors = isDark
      ? ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#60a5fa']
      : ['#0369a1', '#047857', '#b45309', '#be123c', '#6d28d9', '#1d4ed8'];

    charList.forEach((char, index) => {
      ctx.save();
      const x = 25 + index * charWidth + (Math.random() * 6 - 3);
      const y = height / 2 + (Math.random() * 10 - 5);
      const angle = (Math.random() * 40 - 20) * (Math.PI / 180);
      const fontSize = Math.floor(Math.random() * 8) + 26;
      const fontName = fonts[Math.floor(Math.random() * fonts.length)];
      
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `bold ${fontSize}px ${fontName}, monospace`;
      ctx.fillStyle = textColors[index % textColors.length];
      ctx.shadowColor = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }

  speakCode() {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    
    // Spell out letters with small pauses
    const letters = this.currentCode.split('').join(' . ');
    const utterance = new SpeechSynthesisUtterance(`Captcha code is: ${letters}`);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
    this.animateButton(this.audioBtn);
  }

  animateButton(btn) {
    if (!btn) return;
    btn.style.transform = 'scale(0.9) rotate(180deg)';
    btn.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      btn.style.transform = '';
    }, 300);
  }

  validate() {
    const userVal = this.input ? this.input.value.trim() : '';
    const currentLang = document.documentElement.lang || 'ar';
    const t = translations[currentLang] || translations.ar;

    // Case-Insensitive comparison (as specifically requested)
    const isMatch = userVal.toLowerCase() === this.currentCode.toLowerCase();

    if (userVal.length === 0) {
      this.showError(currentLang === 'ar' ? 'يرجى إدخال رمز التحقق أولاً!' : 'Please enter the verification code first!');
      return;
    }

    if (isMatch) {
      this.showSuccess(t.captchaSuccessMsg);
      
      // Trigger PDF Download
      setTimeout(() => {
        this.triggerDownload();
        setTimeout(() => {
          this.closeModal();
          if (window.showToast) {
            window.showToast(t.captchaSuccessMsg, 'success');
          }
        }, 1200);
      }, 500);
    } else {
      this.showError(t.captchaErrorMsg);
      // Shake animation & fresh captcha
      if (this.input) {
        this.input.classList.add('shake', 'error');
        setTimeout(() => {
          this.input.classList.remove('shake');
        }, 600);
      }
      this.generateCaptcha();
    }
  }

  showError(message) {
    if (this.errorMsg) {
      this.errorMsg.textContent = message;
      this.errorMsg.style.display = 'block';
    }
    if (this.successMsg) {
      this.successMsg.style.display = 'none';
    }
  }

  showSuccess(message) {
    if (this.successMsg) {
      this.successMsg.textContent = message;
      this.successMsg.style.display = 'block';
    }
    if (this.errorMsg) {
      this.errorMsg.style.display = 'none';
    }
    if (this.input) {
      this.input.classList.remove('error');
      this.input.classList.add('success');
    }
  }

  triggerDownload() {
    const pdfUrl = 'Waheed_Mohamed_Eid_CV_English.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Waheed_Mohamed_Eid_CV_English.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.captchaInstance = new CaptchaEngine();
});
