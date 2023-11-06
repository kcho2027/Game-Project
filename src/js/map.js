import { Graphics } from './graphics.js';
import { User } from './user.js';

class Map {

    static height = 2000
    static width = 800

    static _offsetx = 0
    static _offsety = 1500

    static points = []

    static name = null

    static init(callback = () => {}) {
        fetch('./sources/map-locations/' + User.mapno + '.json')
        .then(response => response.json())
        .then(jsondata => {
            Map.spawn = jsondata.spawn;
            Map.points = jsondata.locations;
            Map.width = jsondata.width;
            Map.height = jsondata.height;
        }).catch(() => console.log('error loading map'));
    }

    static load() {
        let i = 0;
        let points_graphicobjects = [];
        Map.points.forEach(([x, y]) => {
            let img_id = 'level'
            if (i < User.level) img_id += '-completed';
            if (i > User.level) img_id += '-locked';
            points_graphicobjects.push(new Graphics.GraphicsImage({
                id: 'level-' + i,
                imgid: img_id,
                x: x,
                y: y,
                width: 50,
                height: 50,
            }));
            i++;
        });
        Graphics.add_object(new Graphics.GraphicsImage({
            id: 'map',
            imgid: 'map-' + User.mapno,
            x: 0,
            y: Graphics.height - Map.height,
            width: Map.width,
            height: Graphics.height,
            children: points_graphicobjects
        }));
    }

   static offsetx(dx) {
        if (dx > 0) Map._offsetx = Math.min(Map.width - Graphics.width, Map._offsetx + dx);
        else Map._offsetx = Math.max(0, Map._offsetx + dx);
        Graphics.objects['map'].x = -Map._offsetx
    }

   static offsety(dy) {
        // range of _offsety: 0 - Map.height - Graphics.height
        if (dy > 0) Map._offsety = Math.max(0, Map._offsety - dy);
        else Map._offsety = Math.min(1500, Map._offsety - dy);
        Graphics.objects['map'].y = -Map._offsety
    }
}

export { Map };
