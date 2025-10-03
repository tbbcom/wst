        /*! (c) TheBukitBesi.com — Protected build (domain-locked) */
        // Initialize Canvas
        const canvas = document.getElementById('stickerCanvas');
        const ctx = canvas.getContext('2d');
        
        // State Management
        const state = {
            history: [],
            currentStep: -1,
            particles: [],
            animationFrames: [],
            audioData: null,
            recording: false,
            currentImage: null,
            stickerPack: []
        };

        // Canvas Setup
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 512, 512);
        saveState();

        // Save Canvas State
        function saveState() {
            state.currentStep++;
            if (state.currentStep < state.history.length) {
                state.history.length = state.currentStep;
            }
            state.history.push(canvas.toDataURL());
        }

        // Undo/Redo Functions
        document.getElementById('undoBtn').addEventListener('click', () => {
            if (state.currentStep > 0) {
                state.currentStep--;
                restoreState();
            }
        });

        document.getElementById('redoBtn').addEventListener('click', () => {
            if (state.currentStep < state.history.length - 1) {
                state.currentStep++;
                restoreState();
            }
        });

        function restoreState() {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, 512, 512);
                ctx.drawImage(img, 0, 0);
            };
            img.src = state.history[state.currentStep];
        }

        // File Upload Handler
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        ctx.clearRect(0, 0, 512, 512);
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, 512, 512);
                        
                        // Scale image to fit
                        const scale = Math.min(512/img.width, 512/img.height);
                        const w = img.width * scale;
                        const h = img.height * scale;
                        const x = (512 - w) / 2;
                        const y = (512 - h) / 2;
                        
                        ctx.drawImage(img, x, y, w, h);
                        state.currentImage = img;
                        saveState();
                        updateFileSize();
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Drag and Drop
        const uploadArea = document.querySelector('.upload-area');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('fileInput').files = files;
                const event = new Event('change', { bubbles: true });
                document.getElementById('fileInput').dispatchEvent(event);
            }
        });

        // Text Addition
        document.getElementById('stickerText').addEventListener('input', drawText);
        document.getElementById('fontStyle').addEventListener('change', drawText);
        document.getElementById('textSize').addEventListener('input', function() {
            document.getElementById('textSizeValue').textContent = this.value + 'px';
            drawText();
        });
        document.getElementById('textColor').addEventListener('input', drawText);

        function drawText() {
            const text = document.getElementById('stickerText').value;
            if (text) {
                restoreState(); // Start from current state
                
                const fontSize = document.getElementById('textSize').value;
                const fontStyle = document.getElementById('fontStyle').value;
                const textColor = document.getElementById('textColor').value;
                
                ctx.font = `bold ${fontSize}px ${fontStyle}`;
                ctx.fillStyle = textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Add text shadow for better visibility
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                ctx.fillText(text, 256, 256);
                
                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                
                saveState();
            }
        }

        // Text Animation Effects
        document.querySelectorAll('.effect-btn[data-effect]').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.effect-btn[data-effect]').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                applyTextAnimation(this.dataset.effect);
            });
        });

        function applyTextAnimation(effect) {
            const text = document.getElementById('stickerText');
            text.className = '';
            
            if (effect !== 'none') {
                text.classList.add('kinetic-text');
                // Store animation type for export
                state.textAnimation = effect;
            }
        }

        // Template Gallery
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', function() {
                ctx.clearRect(0, 0, 512, 512);
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, 512, 512);
                
                ctx.font = 'bold 200px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.textContent, 256, 256);
                
                saveState();
                updateFileSize();
            });
        });

        // Voice Recording (Simulated)
        let mediaRecorder;
        const recordBtn = document.getElementById('recordVoice');
        const voiceVisualizer = document.getElementById('voiceVisualizer');
        const voiceTranscript = document.getElementById('voiceTranscript');

        recordBtn.addEventListener('click', async function() {
            if (!state.recording) {
                // Start recording
                state.recording = true;
                this.textContent = '⏹️ Stop Recording';
                this.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
                voiceVisualizer.style.display = 'flex';
                
                // Simulate voice recording
                setTimeout(() => {
                    if (state.recording) {
                        // Simulate AI transcription
                        const sampleTexts = [
                            "Happy Birthday! 🎉",
                            "Good Morning ☀️",
                            "Love You ❤️",
                            "Thank You! 🙏",
                            "Congratulations! 🎊"
                        ];
                        const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
                        voiceTranscript.value = randomText;
                        
                        // Auto-generate sticker from voice
                        document.getElementById('stickerText').value = randomText;
                        drawText();
                        
                        // Apply random particle effect
                        const effects = ['stars', 'hearts', 'confetti'];
                        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                        applyParticleEffect(randomEffect);
                    }
                }, 3000);
            } else {
                // Stop recording
                state.recording = false;
                this.textContent = '🎤 Start Recording';
                this.style.background = '';
                voiceVisualizer.style.display = 'none';
            }
        });

        // Particle Effects
        document.querySelectorAll('.particle-effect').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.particle-effect').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                applyParticleEffect(this.dataset.particle);
            });
        });

        function applyParticleEffect(type) {
            const particles = {
                stars: '⭐',
                hearts: '❤️',
                snow: '❄️',
                fire: '🔥',
                bubbles: '🫧',
                confetti: '🎊'
            };
            
            const particleSymbol = particles[type];
            
            // Add particles to canvas
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const size = Math.random() * 30 + 10;
                
                ctx.font = `${size}px Arial`;
                ctx.fillText(particleSymbol, x, y);
            }
            ctx.globalAlpha = 1;
            
            saveState();
        }

        // Background Removal (Simulated)
        document.getElementById('removeBg').addEventListener('click', function() {
            if (state.currentImage) {
                // Simulate AI background removal
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                
                // Simple edge detection simulation
                for (let i = 0; i < 50; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 512;
                    if (Math.random() > 0.5) {
                        ctx.fillRect(x, y, 10, 10);
                    }
                }
                
                ctx.globalCompositeOperation = 'source-over';
                saveState();
            }
        });

        // Background Blur
        document.getElementById('blurBg').addEventListener('click', function() {
            ctx.filter = 'blur(5px)';
            ctx.drawImage(canvas, 0, 0);
            ctx.filter = 'none';
            saveState();
        });

        // Background Color
        document.getElementById('bgColor').addEventListener('input', function() {
            const color = this.value;
            const imageData = ctx.getImageData(0, 0, 512, 512);
            
            // Create new canvas for background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 512;
            tempCanvas.height = 512;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.fillStyle = color;
            tempCtx.fillRect(0, 0, 512, 512);
            tempCtx.drawImage(canvas, 0, 0);
            
            ctx.clearRect(0, 0, 512, 512);
            ctx.drawImage(tempCanvas, 0, 0);
            saveState();
        });

        // 3D Effects
        document.getElementById('apply3D').addEventListener('click', function() {
            const rotation = document.getElementById('rotation3D').value;
            const shadow = document.getElementById('shadowDepth').value;
            
            ctx.save();
            ctx.setTransform(1, 0, rotation/100, 1, 0, 0);
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = shadow;
            ctx.shadowOffsetX = shadow/2;
            ctx.shadowOffsetY = shadow/2;
            
            ctx.drawImage(canvas, 0, 0);
            ctx.restore();
            
            saveState();
        });

        // Clear Canvas
        document.getElementById('clearCanvas').addEventListener('click', function() {
            ctx.clearRect(0, 0, 512, 512);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 512, 512);
            saveState();
            updateFileSize();
        });

        // File Size Estimation
        function updateFileSize() {
            canvas.toBlob(function(blob) {
                const sizeInKB = (blob.size / 1024).toFixed(1);
                document.getElementById('fileSize').textContent = sizeInKB + ' KB';
                
                // Update status based on size
                const status = document.getElementById('exportStatus');
                if (blob.size < 100000) {
                    status.textContent = '⚠️ Too small';
                    status.style.color = '#f39c12';
                } else if (blob.size > 1000000) {
                    status.textContent = '⚠️ Too large';
                    status.style.color = '#e74c3c';
                } else {
                    status.textContent = '✅ Perfect';
                    status.style.color = '#27ae60';
                }
            }, 'image/webp', 0.95);
        }

        // Quality Slider
        document.getElementById('quality').addEventListener('input', function() {
            document.getElementById('qualityValue').textContent = this.value + '%';
            updateFileSize();
        });

        // Smart Optimize
        document.getElementById('optimizeBtn').addEventListener('click', function() {
            // Simulate optimization process
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = '<div class="progress-fill"></div>';
            this.parentElement.insertBefore(progressBar, this);
            
            const fill = progressBar.querySelector('.progress-fill');
            let progress = 0;
            
            const interval = setInterval(() => {
                progress += 10;
                fill.style.width = progress + '%';
                
                if (progress >= 100) {
                    clearInterval(interval);
                    progressBar.remove();
                    
                    // Apply optimization
                    const quality = 85;
                    document.getElementById('quality').value = quality;
                    document.getElementById('qualityValue').textContent = quality + '%';
                    updateFileSize();
                    
                    // Show success message
                    this.textContent = '✅ Optimized!';
                    setTimeout(() => {
                        this.textContent = '⚡ Smart Optimize';
                    }, 2000);
                }
            }, 100);
        });

        // Export Functions
        document.getElementById('exportStatic').addEventListener('click', function() {
            const quality = document.getElementById('quality').value / 100;
            
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'whatsapp-sticker-' + Date.now() + '.webp';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/webp', quality);
        });

        document.getElementById('exportAnimated').addEventListener('click', function() {
            // Create animated WebP (simulated with multiple frames)
            alert('Animated sticker export would create a WebP with multiple frames. This is a demo version.');
            
            // In production, this would use a WebP encoder library
            const quality = document.getElementById('quality').value / 100;
            
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'whatsapp-animated-sticker-' + Date.now() + '.webp';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/webp', quality);
        });

        // Batch Pack Management
        document.getElementById('addToPack').addEventListener('click', function() {
            canvas.toBlob(function(blob) {
                state.stickerPack.push(blob);
                document.getElementById('exportPack').textContent = `📤 Export Pack (${state.stickerPack.length})`;
                
                // Show success
                const btn = document.getElementById('addToPack');
                btn.textContent = '✅ Added!';
                setTimeout(() => {
                    btn.textContent = '➕ Add to Pack';
                }, 1500);
            }, 'image/webp', 0.95);
        });

        document.getElementById('exportPack').addEventListener('click', function() {
            if (state.stickerPack.length === 0) {
                alert('Pack is empty! Add some stickers first.');
                return;
            }
            
            // In production, this would create a ZIP file with all stickers
            alert(`Pack contains ${state.stickerPack.length} stickers. In production, this would download as a ZIP file.`);
        });

        // Modal Functions
        function closeModal() {
            document.getElementById('helpModal').classList.remove('show');
        }

        // Initialize particles animation
        function createParticles() {
            const container = document.createElement('div');
            container.className = 'particle-icontainer';
            document.body.appendChild(container);
            
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 3 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                container.appendChild(particle);
            }
        }

        // Initialize
        createParticles();
        updateFileSize();

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z':
                        e.preventDefault();
                        document.getElementById('undoBtn').click();
                        break;
                    case 'y':
                        e.preventDefault();
                        document.getElementById('redoBtn').click();
                        break;
                    case 's':
                        e.preventDefault();
                        document.getElementById('exportStatic').click();
                        break;
                }
            }
        });
