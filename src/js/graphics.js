import { User } from './user.js';
import { Utils } from './utils.js';

class Graphics {

    static ctx;
    static width = 500;
    static height = 500;
    static offsetX;
    static offsetY;

    static images = {};

    // TODO render priority
    static objects = {};

    static init(callback) {

        let canvas = document.getElementById('game');
        if (!canvas || !canvas.getContext) { alert('unsupported browser or error loading resources'); return };

        this.ctx = canvas.getContext('2d');
        if (!this.ctx) { alert('unsupported browser or error loading resources'); return };

        // this.width = Math.floor(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) * 0.6);
        // this.height = Math.floor( (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) * 0.6 );

        Graphics.offsetX = canvas.offsetLeft;
        Graphics.offsetY = canvas.offsetTop;

        let scale = window.devicePixelRatio;

        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';
        canvas.width = Math.floor(this.width * scale);
        canvas.height = Math.floor(this.height * scale);
        canvas.style.border = '1px solid black';

        this.ctx.scale(scale, scale);

        canvas.oncontextmenu = () => false;

        canvas.onmousedown = (e) => {

            let x = (e.x || e.pageX || e.clientX || e.layerX) - this.offsetX,
                y = (e.y || e.pageY || e.clientY || e.layerY) - this.offsetY;

            for (const object of Object.values(Graphics.objects)) {
                if (!object.onmousedown) continue;
                // collission
                if (object instanceof Graphics.GraphicsRectangle && Utils.point_in_rect(x, y, object)) {
                    object.onmousedown(e);
                } else if (object instanceof Graphics.GraphicsCircle && Utils.point_in_circle(x, y, object)) {
                    object.onmousedown(e);
                }
            }
        }

        canvas.onmouseup = (e) => {
            let x = (e.x || e.pageX || e.clientX || e.layerX) - this.offsetX,
                y = (e.y || e.pageY || e.clientY || e.layerY) - this.offsetY;
        }

        canvas.onmousemove = (e) => {
            let x = (e.x || e.pageX || e.clientX || e.layerX) - this.offsetX,
                y = (e.y || e.pageY || e.clientY || e.layerY) - this.offsetY;
        }

        canvas.onmouseenter = (e) => {
        }

        canvas.onmouseleave = (e) => {
        }

        // load images
        let images = {
            'start-bg': 'sources/images/start-bg.jpg',
            'player': 'sources/images/player.png',
            'level': 'sources/images/level.png',
            'level-locked': 'sources/images/level-locked.png',
            'level-completed': 'sources/images/level-completed.png',
            'map-0': 'sources/images/map-0.png',
        };

        for (const [title, src] of Object.entries(images)) {
            this.load_image(src, title, () => {
                if (Object.keys(Graphics.images).length == Object.keys(images).length) {
                    console.log('all images loaded');
                    callback();
                }
            });

        }

        this.clear_screen();
        console.log('Graphics.init() successful')
    }

    static load_image(src, title, f = () => {}) {
        let img = new Image;
        img.src = src;
        //console.log('loading ' + title);
        img.onload = function() {
            // console.log('loaded ' + title)
            Graphics.images[title] = this;
            f();
        }
    }

    static render() {
        this.clear_screen();
        for (const object of Object.values(this.objects)) {
            object.render();
        }
    }

    // could either save them in Graphics.images or load them each time from cache.
    static render_image(image, x, y) {
        if (Graphics.images[image]) {
            Graphics.ctx.drawImage(Graphics.images[image], x || 0, y || 0);
        }
    }

    static clear_screen(color) {
        this.ctx.fillStyle = color || 'white';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    static render_text(text, x, y, align, font) {
        this.ctx.fillStyle = font || '30px serif';
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
    }

    static add_object(obj) {
        if (obj.id)
            this.objects[obj.id] = obj;
        else
            console.log('could not add object; missing id')
    }

    static GraphicsObject = class {

        constructor({ id, x, y, fillStyle, strokeStyle, children, onmousedown }) {

            if (!id) console.log('object created without id!');
            this.id = id;
            this.x = x || 0;
            this.y = y || 0;
            this.fillStyle = fillStyle || 'black';
            this.strokeStyle = strokeStyle || null;
            this.children = children || [];
            this.onmousedown = onmousedown || null;
            this.onmouseover = onmouseover || null;
            // this.onmouseleft = onmousedown || null;
            // this.onmouseright = onmoueleft || null;

            this.draggable = false;
        }
        render() {
            Graphics.ctx.translate(this.x, this.y);
            for (const child of this.children) {
                child.render();
            }
            Graphics.ctx.translate(-this.x, -this.y);
        }

        render_children() {
            Graphics.ctx.translate(this.x, this.y);
            for (const child of this.children) {
                child.render();
            }
            Graphics.ctx.translate(-this.x, -this.y);
        }

        add_child(child) {
            this.children.push(child);
        }
        insert_child(child, index = 0) {
            this.children.splice(index, 0, child);
        }
    }

    static GraphicsRectangle = class extends Graphics.GraphicsObject {

        constructor({ id, x, y, width, height, children, strokeStyle, fillStyle, onmousedown }) {
            super(arguments[0]);
            this.width = width;
            this.height = height;
        }

        render() {

            Graphics.ctx.fillStyle = this.fillStyle;

            if (this.strokeStyle) {
                Graphics.ctx.strokeStyle = this.strokeStyle;
                Graphics.ctx.strokeRect(this.x, this.y, this.width, this.height);
            }

            Graphics.ctx.fillRect(this.x, this.y, this.width, this.height);

            this.render_children();
        }
    }

    static GraphicsCircle = class extends Graphics.GraphicsObject {

        constructor({ id, x, y, r, fillStyle, strokeStyle, children, onmousedown }) {
            super(arguments[0]);
            this.r = r;
        }

        render() {

            Graphics.ctx.fillStyle = this.fillStyle;
            Graphics.ctx.beginPath();
            Graphics.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            Graphics.ctx.fill();
            if (this.strokeStyle) {
                Graphics.ctx.strokeStyle = this.strokeStyle;
                Graphics.ctx.stroke();
            }
            Graphics.ctx.closePath();
            this.render_children();
        }
    }

    // https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial/Drawing_text
    // TODO make text background
    static GraphicsText = class extends Graphics.GraphicsObject {

        constructor({ id, text, x, y, align, base, font, fillStyle, strokeStyle }) {
            super(arguments[0]);
            this.text = text;
            this.align = align || 'center';
            this.base = base || 'bottom';
            this.font = font || '30px serif';
        }

        render() {
            Graphics.ctx.textAlign = this.align;
            Graphics.ctx.font = this.font;
            Graphics.ctx.textAlign = this.align;
            Graphics.ctx.textBaseline = this.base;
            Graphics.ctx.fillStyle = this.fillStyle;

            if (this.stokeStyle) {
                Graphics.ctx.strokeStyle = this.strokeStyle;
                Graphics.ctx.strokeText(this.text, this.x, this.y);
            }

            Graphics.ctx.fillText(this.text, this.x, this.y);
            this.render_children();
        }
    }

    static GraphicsImage = class extends Graphics.GraphicsObject {

        constructor({ id, x, y, width, height, imgid, fillStyle, strokeStyle }) {
            super(arguments[0]);
            this.imgid = imgid;
            this.width = width || Graphics.width;
            this.height = height || Graphics.height;
        }

        render() {
            Graphics.render_image(this.imgid, this.x, this.y, this.width, this.height);
            if (this.strokeStyle) {
                Graphics.ctx.strokeStyle = this.strokeStyle;
                Graphics.ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
            this.render_children();
        }
    }

    static GraphicsGif = class extends Graphics.GraphicsObject {
        constructor({ id, x, y, width, height, src, fillStyle, strokeStyle, delay }) {
            super(arguments[0]);
            this.src = src;
            this.width = width || Graphics.width;
            this.width = height || Graphics.height;
        }

        render() {
            this.render_children();
        }
    }


}

export { Graphics };
