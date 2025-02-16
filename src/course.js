function Course() {
    return {
        current: 0,
        get currentHole() {
            return this.holes[this.current-1]
        },
        holes: [
        {
            name:'Bird\'s Eye',
            par:2,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(0,2,100);
                golf.addGround(0,0,100,{bumpers:"0011"});
                golf.addCorner(0,0,160);
                golf.addCorner(60,0,100,{rotation:Math.PI});
                golf.addBarrier(30,0,130,{shape:"circle",size:20});
                var m = golf.addGround(60,0,160,{bumpers:"1100"});
                golf.addHole(m);
            }
        },
        {
            name:'Dog Leg',
            par:2,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(0,2,110);
                golf.addGround(0,0,100,{bumpers:"0111"});
                golf.addCorner(0,0,160);
                golf.addGround(59,-6,160,{bumpers:"1010", rotation:{x:0,y:0,z:-.2}});
                var m = golf.addGround(117,-12,160,{bumpers:"1110"});
                golf.addHole(m);
            }
        },
        {
            name:'Rabbit Hole',
            par:3,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(0,2,80);
                golf.addGround(0,0,100,{bumpers:"0111"});
                golf.addGround(0,0,160,{bumpers:"0101"});
                golf.addBarrier(0,0,130,{shape:"circle",size:20});
                var t = golf.addTunnel(25.5, -14, 160,{rotation:-Math.PI/2});
                golf.addTunnel(0,0,186, {target: t});
                golf.addGround(60,-14,160,{bumpers:"1100",mesh:"deformed4"});
                var m = golf.addGround(60,-14,100,{bumpers:"0111"});
                golf.addHole(m);
            }
        },
        {
            name:'Leap Frog',
            par:2,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(30,2,95);
                golf.addGround(45,0,100,{bumpers:"0110",mesh:"narrow"});
                golf.addCorner(0,0,100,{rotation:-Math.PI/2});
                golf.addBarrier(38,0,124,{shape:"box",size:17});
                golf.addBarrier(52,0,124,{shape:"box",size:17});
                golf.addBarrier(38,-7,124,{shape:"box",size:17});
                golf.addBarrier(52,-7,124,{shape:"box",size:17});
                golf.addGround(0,6,158,{bumpers:"0101", rotation:{x:-.2,y:0,z:0}});
                golf.addGround(0,12,201,{bumpers:"0101",mesh:"short"});
                var m = golf.addGround(0,12,246,{bumpers:"1101"});
                golf.addHole(m);
            }
        },
        {
            name:'Cat Nap',
            par:2,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(55,2,88);
                golf.addGround(45,0,100,{bumpers:"0010", mesh:"narrow"});
                golf.addCorner(0,0,100,{rotation:-Math.PI/2});
                golf.addCorner(90,0,100,{rotation:Math.PI});

                golf.addBarrier(38,0,124,{shape:"box",size:17});
                golf.addBarrier(52,0,124,{shape:"box",size:17});
                golf.addBarrier(38,-7,124,{shape:"box",size:17});
                golf.addBarrier(52,-7,124,{shape:"box",size:17});

                golf.addBarrier(38,-7,187.5,{shape:"box",size:17});
                golf.addBarrier(52,-7,187.5,{shape:"box",size:17});
                golf.addBarrier(38,-14,187.5,{shape:"box",size:17});
                golf.addBarrier(52,-14,187.5,{shape:"box",size:17});


                golf.addBumper(90,3,195.5);
                golf.addBumper(75,-5,195.5, {half:true});

                var t = golf.addTunnel(115.5, 3, 216,{rotation:Math.PI/2});
                golf.addTunnel(90,12,191, {target: t, exitVelocity:150});

                golf.addGround(0,-6,158,{bumpers:"0101", rotation:{x:.2,y:0,z:0}});
                golf.addGround(90,6,158,{bumpers:"0101", rotation:{x:-.2,y:0,z:0}});
                golf.addBumper(60,0,165,{rotation:{x:0,y:Math.PI/2,z:0}});

                var m = golf.addCorner(0,-12,216);

                golf.addGround(60,-12,216,{bumpers:"1000"});
                golf.addGround(88,-4.5,216,{bumpers:"1010", rotation:{x:0,y:0,z:.25}});
                golf.addHole(m);
            }
        },

        {
            name:'Whale Tail',
            par:3,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(60,2,145);
                golf.addGround(60,0,145,{bumpers:"1011"});
                golf.addGround(103,4,145,{bumpers:"0000", mesh:"narrow",rotation: {x:0,y:0,z:.3}});
                golf.addGround(103,4,205,{bumpers:"0000", mesh:"narrow",rotation: {x:0,y:0,z:.3}});
                golf.addBumper(103.5,7, 115,{half:true});
                golf.addBumper(103.5,0,115,{half:true});

                golf.addBumper(103.5,7,235,{half:true});
                golf.addBumper(103.5,0,235,{half:true});

                golf.addBumper(76,3.5,115,{half:true, rotation: {x:0,y:0,z:.25}});
                golf.addBumper(76,3.5,235,{half:true, rotation: {x:0,y:0,z:.25}});

                golf.addBumper(118,7,145,{rotation:{x:0,y:Math.PI/2,z:0}});
                golf.addBumper(118,7,205,{rotation:{x:0,y:Math.PI/2,z:0}});

                golf.addBumper(89 ,0,190,{half:true, rotation:{x:0,y:Math.PI/2,z:0}});
                golf.addBumper(90 ,0,190,{half:true, rotation:{x:0,y:Math.PI/2,z:0}});
                golf.addBumper(30 ,0,190,{half:true, rotation:{x:0,y:Math.PI/2,z:0}});

                golf.addGround(60,0,220,{bumpers:"1010", mesh:"short"});
                golf.addCorner(0,0,205);

                var m = golf.addCorner(0,0,145,{rotation:-Math.PI/2});
                golf.addHole(m);
            }
        },
        {
            name:'Horse Shoe',
            par:3,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(-10,2,55);
                golf.addGround(0,0,55,{bumpers:"0111",mesh:"short"});
                golf.addGround(0,0,100,{bumpers:"0001",mesh:"deformed1"});
                golf.addCorner(0,0,160);
                golf.addBarrier(30,0,130,{shape:"circle", size:20})
                golf.addGround(60,0,100,{bumpers:"0101",mesh:"deformed4"});
                golf.addCorner(60,0,160,{rotation:Math.PI/2});
                var m = golf.addGround(60,0,55,{bumpers:"0111",mesh:"short"});
                golf.addHole(m);
            }
        },
        {
            name:'Snake Bite',
            par:4,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(0,2,100);
                var m = golf.addGround(60,0,100,{bumpers:"0111"});

                golf.addBumper(-30,0,145,{half:true,rotation:{x:0,y:Math.PI/2,z:0}});
                golf.addBumper(30,0,145,{half:true,rotation:{x:0,y:Math.PI/2,z:0}});
                golf.addBumper(-30,0,205,{half:true,rotation:{x:0,y:Math.PI/2,z:0}});
                golf.addBumper(30,0,205,{half:true,rotation:{x:0,y:Math.PI/2,z:0}});
                golf.addCorner(0,0,100,{rotation:-Math.PI/2});
                golf.addGround(0,.5,131,{rotation:{x:-.24,y:0,z:0}});
                golf.addGround(0,.5,219,{rotation:{x:+.24,y:0,z:0}});

                golf.addBumper(0,0,190,);
                golf.addBumper(0,0,160,);

                golf.addCorner(0,0,246,{rotation:Math.PI/2});
                golf.addGround(-60,0,246,{bumpers:"1001"});
                golf.addCorner(-60,0,190,{rotation:-Math.PI/2});
                golf.addGround(0,0,175);

                golf.addCorner(60,0,160,{rotation:Math.PI/2});
                golf.addHole(m);
            }
        },
        {
            name:'Ant Hill',
            par:3,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(0,22,80);

                golf.addBumper(0,6,70,{bumpers:"0111"});
                golf.addGround(0,20,100,{bumpers:"0111"});
                golf.addGround(0,20,160,{bumpers:"0101"});
                golf.addBarrier(0,20,112,{shape:"box",size:15, rotation:{x:0,y:Math.PI/4,z:0}});
                golf.addBarrier(-25,20,75,{shape:"box",size:10});
                golf.addBarrier(25,20,75,{shape:"box",size:10});

                var r1 = golf.addTunnel(25.5, 6, 100,{rotation:-Math.PI/2});
                var r2 = golf.addTunnel(85,0,220, {rotation:Math.PI/2});
                var l1 = golf.addTunnel(-25.5, 6, 100,{rotation:Math.PI/2});
                var l2 = golf.addTunnel(-85,0,220, {rotation:-Math.PI/2});
                var c1 = golf.addTunnel(0,1,186, {rotation:Math.PI});

                golf.addTunnel(-25,20,110, {target: l1, rotation:-Math.PI/2});
                golf.addTunnel(25,20,110, {target: r1, rotation:Math.PI/2});
                golf.addTunnel(0,20,186, {target: c1, exitVelocity:40});

                golf.addGround(60,6,160,{bumpers:"0101"});
                golf.addGround(60,6,100,{bumpers:"0110",mesh:"deformed3"});
                golf.addTunnel(60,6,186, {target: r2});

                golf.addGround(-60,6,160,{bumpers:"0101",mesh:"deformed2"});
                golf.addGround(-60,6,100,{bumpers:"0011"});
                golf.addTunnel(-60,6,186, {target: l2});

                golf.addBumper(0,15,190.5,{bumpers:"0111"});

                golf.addGround(-60,0,220,{bumpers:"1010"});
                var m = golf.addGround(0,0,220,{bumpers:"1000"});
                golf.addHole(m);

                golf.addGround(60,0,220,{bumpers:"1010"});
            }
        },
        {
            name:'Billy Goat',
            par:4,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(50,2,88);
                golf.addGround(45,0,100,{bumpers:"1011", mesh:"narrow"});
                golf.addBarrier(45,0,134,{shape:"box",size:31});
                var m = golf.addGround(0,24,100,{bumpers:"0111"});
                golf.addGround(90,0,100,{bumpers:"0110", mesh:"deformed3"});

                golf.addBarrier(45,12,202,{shape:"box",size:31});


                golf.addBumper(30,10,100,{rotation:{x:0,y:Math.PI/2,z:0}});

                golf.addGround(0,18,158,{bumpers:"0101", rotation:{x:.2,y:0,z:0}});
                golf.addGround(90,6,158,{bumpers:"0101", rotation:{x:-.2,y:0,z:0}});
                golf.addBumper(60,0,165,{rotation:{x:0,y:Math.PI/2,z:0}});

                golf.addCorner(0,12,216);
                golf.addGround(45,12,216,{bumpers:"1010", mesh:"narrow"});
                golf.addCorner(90,12,216,{rotation:Math.PI/2});
                golf.addHole(m);
            }
        },
        {
            name:'Bullseye',
            par:2,
            strokes:0,
            complete:false,
            build:function(golf) {
                golf.addBall(0,2,100);
                golf.addCorner(0,0,100,{rotation:-Math.PI/2});
                golf.addCorner(0,0,160);
                golf.addCorner(60,0,100,{rotation:Math.PI});
                golf.addBarrier(30,0,130,{shape:"bump",size:30});
                var m = golf.addCorner(60,0,160,{rotation:Math.PI/2});
                golf.addHole(m);
            }
        }
      ]
    }
}

export default Course;
