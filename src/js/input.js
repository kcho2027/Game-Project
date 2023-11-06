class InputManager {

    constructor() {
        this.callbacks = {};
    }

    subscribe(key, callback, id) {
        if (!this.callbacks[key]) this.callbacks[key] = {}
        this.callbacks[key][id] = callback
    }

    unsubscribe(key, id) {
        delete this.callbacks[key][id];
    }

    // TODO
    disable(key, id) { }
    enable(key, id) { }

    call(key) {
        if (this.callbacks[key])
            for (const f of Object.values(this.callbacks[key]))
                f()
    }
}

const InputStatus = {
};

class Input {

    static keydown = new InputManager
    static keyup = new InputManager

    static init() {
        window.onkeydown = e => {
            if (InputStatus[e.key]) return;
            InputStatus[e.key] = true;
            this.keydown.call(e.key);
        }
        window.onkeyup = e => {
            delete InputStatus[e.key];
            this.keyup.call(e.key);
        }
    }
}


export { Input, InputStatus }
