/**
 * Facada Noir - Asset Loader
 * Carrega imagens, áudio e JSON com barra de progresso e cache.
 */

class AssetLoader {
    constructor() {
        this.cache = new Map();
        this.loading = false;
        this.total = 0;
        this.loaded = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    loadImage(key, src) {
        if (this.cache.has(key)) return Promise.resolve(this.cache.get(key));

        this.total++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(key, img);
                this.loaded++;
                this._updateProgress();
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`[AssetLoader] Falha ao carregar imagem: ${src}. Usando placeholder.`);
                const placeholder = this._createPlaceholderImage();
                this.cache.set(key, placeholder);
                this.loaded++;
                this._updateProgress();
                resolve(placeholder);
            };
            img.src = src;
        });
    }

    loadJSON(key, src) {
        if (this.cache.has(key)) return Promise.resolve(this.cache.get(key));

        this.total++;
        return fetch(src)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                this.cache.set(key, data);
                this.loaded++;
                this._updateProgress();
                return data;
            })
            .catch(err => {
                console.warn(`[AssetLoader] Falha ao carregar JSON: ${src}. Retornando objeto vazio.`, err);
                const empty = {};
                this.cache.set(key, empty);
                this.loaded++;
                this._updateProgress();
                return empty;
            });
    }

    get(key) {
        return this.cache.get(key) || null;
    }

    _updateProgress() {
        if (this.onProgress && this.total > 0) {
            const progress = this.loaded / this.total;
            this.onProgress(progress, this.loaded, this.total);
        }
        if (this.loaded >= this.total && this.onComplete && this.loading) {
            this.loading = false;
            this.onComplete();
        }
    }

    _createPlaceholderImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('NOIR', 2, 18);
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    loadQueue(manifest, onProgress, onComplete) {
        this.loading = true;
        this.total = 0;
        this.loaded = 0;
        this.onProgress = onProgress;
        this.onComplete = onComplete;

        const promises = [];
        if (manifest.images) {
            for (const [key, src] of Object.entries(manifest.images)) {
                promises.push(this.loadImage(key, src));
            }
        }
        if (manifest.json) {
            for (const [key, src] of Object.entries(manifest.json)) {
                promises.push(this.loadJSON(key, src));
            }
        }

        if (promises.length === 0) {
            if (this.onComplete) this.onComplete();
        }

        return Promise.all(promises);
    }
}

window.AssetLoader = AssetLoader;
window.assets = new AssetLoader();