import { Graphics } from './graphics.js';
import { Input, InputStatus } from './input.js';
import { User } from './user.js';
import { Map } from './map.js';
import { Utils } from './utils.js';
import { Level } from './level.js';

class Game {

    static player_loc = 0;
    static active = false;
    static player_step = 2;
    static map_padding = 25;

    static init() {

        Input.keydown.subscribe('Escape', () => {
            Game.active ^= true;
            if (Game.active) Game.loop();
        });
    }

    static loop() {
        if (InputStatus['w']) Game.player_move(0, -Game.player_step);
        if (InputStatus['s']) Game.player_move(0, Game.player_step);
        if (InputStatus['d']) Game.player_move(Game.player_step, 0);
        if (InputStatus['a']) Game.player_move(-Game.player_step, 0);
        Game.active && window.setTimeout(Game.loop, 1);
    }

    static start() {

        Graphics.render_image();
        Graphics.clear_screen();

        Map.load();

        Graphics.objects['map'].insert_child(new Graphics.GraphicsImage({
            id: 'player',
            x: Map.spawn[0],
            y: Map.spawn[1],
            width: 50,
            height: 50,
            imgid: 'player',
        }), 0);
        Graphics.render();
        Game.active = true;
        Game.loop();
    }

    static player_move(dx, dy) {

        let player = Graphics.objects['map'].children[0];

        // update pos, map
        player.x += dx;
        player.y += dy;

        if (dx > 0) player.x = Math.min(player.x, Map.width - Game.map_padding - player.width);
        else        player.x = Math.max(player.x, Game.map_padding);

        if (dy > 0) player.y = Math.min(player.y, Map.height - Game.map_padding - player.height);
        else        player.y = Math.max(player.y, Game.map_padding);
        
        console.log(Map._offsetx + player.x + player.width, Graphics.width - Game.map_padding)
        if (player.x - Map._offsetx < Game.map_padding || player.x + player.width - Map._offsetx > Graphics.width - Game.map_padding) Map.offsetx(dx);
        if (player.y - Map._offsety < Game.map_padding || player.y + player.height - Map._offsety > Graphics.height - Game.map_padding) Map.offsety(-dy);

        delete Graphics.objects['level-alert'];

        // check if player is colliding with level
        let i = 0;
        for (const level of Graphics.objects['map'].children.slice(1)) {
            if (Utils.rect_touching_rect(player, level)) {
                if (i <= User.level) {
                    Graphics.add_object(new Graphics.GraphicsText({
                        id: 'level-alert',
                        x: level.x + level.width / 2 - Map._offsetx,
                        y: level.y + level.height - Map._offsety,
                        text: 'press [F] to play',
                        strokeStyle: 'black',
                        align: 'center',
                        font: '10px serif'
                    }));
                } else {
                    Graphics.add_object(new Graphics.GraphicsText({
                        id: 'level-alert',
                        x: level.x + level.width / 2 - Map._offsetx,
                        y: level.y + level.height - Map._offsety,
                        text: 'you haven\'t unlocked this level yet!',
                        strokeStyle: 'black',
                        align: 'center',
                        font: '10px serif'
                    }));
                }
            }
            i++;
        }

        Graphics.render();
    }

}

export { Game };
