
///////////////////////////////////////////////////////////////
///
/// KACHOW!
/// A quick recreation by a huge 2600 fan
///
/// Chad Jenkins
/// (odestcj@gmail.com)
///
/// Written mostly on a transatlantic flight trip,
/// expect lots of quirks from hastily written code
///
///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////
//                                                           //
//                    CONSTANT STATE                         //

// TODO: DECLARE and INTIALIZE your constants here
var START_TIME = currentTime();
var BOMBS_MAX = 20;

version = 0;
if (location.href.split("?")[1] == "pants")
    version = 1;

if (version == 1) {  // "pants"
    INTRO_SOUND = loadSound("tonight.wav");
    CATCH_SOUND = loadSound("honey.wav");
    EXPLODE_SOUND = loadSound("pants.wav");
    BOMBER_SPRITE = loadImage("larry.png");
    BOMBER_SPRITE_OFFSET = 0.7; 
    BOMB_SPRITE = loadImage("pants.png");
    TITLE = loadImage("pants_title.png");
    TITLE_BOTTOM = loadImage("quick_title_crop.png");
    BUCKET_SPRITE = loadImage("couch.png");
    EXPLODE_SPRITE = loadImage("bomb_explode.png");
    if (Math.random() > .8)
        var BOTTOM_LABEL = loadImage("odestcj.png");
    else
        var BOTTOM_LABEL = loadImage("odestcj2.png");
}
else {  // original
    BOMBER_SPRITE = loadImage("bomber.png");
    BOMBER_SPRITE_OFFSET = 0.5; 
    CATCH_SOUND = loadSound("bomb_catch_shorter.wav");
    EXPLODE_SOUND = loadSound("bomb_explode.wav");
    BOMB_SPRITE = loadImage("bomb.png");
    EXPLODE_SPRITE = loadImage("bomb_explode.png");
    TITLE = loadImage("quick_title.png");
    BUCKET_SPRITE = loadImage("bucket.png");
    if (Math.random() > .8)
        var BOTTOM_LABEL = loadImage("odestcj.png");
    else
        var BOTTOM_LABEL = loadImage("odestcj2.png");
}


///////////////////////////////////////////////////////////////
//                                                           //
//                     MUTABLE STATE                         //

// TODO: DECLARE your variables here
var lastKeyCode;
var bucket,bomber,bombs,score;
var cur_bomb = -1;
var mark_time;


///////////////////////////////////////////////////////////////
//                                                           //
//                      EVENT RULES                          //

// When setup happens...
function onSetup() {
    // TODO: INITIALIZE your variables here
    lastKeyCode = 0;

    game = makeObject();
    game.state = -1;  // -1:title, 0:playing, 1:finishing, 2: lost life, 3:placeholder, 4:ended
    game.lives = 3;
    game.stage = 0;
    game.dropped = makeObject();
    game.dropped.stage = 0;
    game.dropped.game = 0;
    game.dropped.limit = 10;

    game.stages = new Array();

    game.stages[0] = new Object();
    game.stages[0].limit = 10;
    game.stages[0].speed = 30;
    game.stages[0].droprate = 0.05;

    var i;
    for (i=0;i<7;i++) {
        game.stages[i] = new Object();
        game.stages[i].limit = 10 + i*5;
        game.stages[i].speed = 30 + i*20;
        game.stages[i].droprate = 0.05 + i*0.06;
    }

    bucket = makeObject();  //what does this function do (and is it needed)?
    bucket.width = 200;
    bucket.height = 59;
    bucket.speed = 70;

    bucket.pos = makeObject();
    bucket.pos.x = screenWidth/2;
    bucket.pos.y = screenHeight-300;

    bucket.key = makeObject();
    bucket.key.left = makeObject();
    bucket.key.left.code = asciiCode('A');
    bucket.key.left.pressed = false;
    bucket.key.right = makeObject;
    bucket.key.right.code = asciiCode('D');
    bucket.key.right.pressed = false;
    bucket.color = makeColor(1,1,1);

    // issue: this should be pointer to a constant variable
    bucket.sprite = BUCKET_SPRITE;

    bomber = makeObject(); 
    bomber.width = 100;
    bomber.height = 200;
    bomber.speed = 30;
    bomber.color = makeColor(1,0,1);
    bomber.droprate = 0.05;

    bomber.pos = makeObject();
    bomber.pos.x = screenWidth/2;
    bomber.pos.y = 200;

    bomber.target = makeObject();
    bomber.target.x = screenWidth/4;
    bomber.target.y = bomber.pos.x;

    bomber.sprite = BOMBER_SPRITE;

    var i; 
    bombs = new Array();
 
    for (i=0;i<BOMBS_MAX;i++) {
        bombs[i] = makeObject(); 
        //bombs[i].width = 50;
        //bombs[i].height = 75;
        bombs[i].width = 66;
        bombs[i].height = 82;
        bombs[i].speed = 30;
        bombs[i].active = false;

        bombs[i].pos = makeObject();
        bombs[i].pos.x = 100 + (i/BOMBS_MAX) * (screenWidth-200);
        bombs[i].pos.y = 200 + (i/BOMBS_MAX) * 200;
        bombs[i].color = makeColor(1,0,0);
    }
    
    score = 0;



}


// When a key is pushed
function onKeyStart(key) {  // key handler, sets flags when a key is pressed
    lastKeyCode = key;

    if (key == bucket.key.left.code) {
        bucket.key.left.pressed = true;
    }
    if (key == bucket.key.right.code) {
        bucket.key.right.pressed = true;
    }
}

function onKeyEnd(key) { 
    if (key == bucket.key.left.code) {
        bucket.key.left.pressed = false;
    }
    if (key == bucket.key.right.code) {
        bucket.key.right.pressed = false;
    }
}

// Called 30 times or more per second
function onTick() {


    animate();
    display();

}

function animate() {

  var i;

  if (game.state < 0) {
    if ((bucket.key.left.pressed)||(bucket.key.right.pressed)) {
        game.state = 0;
        if (typeof INTRO_SOUND !== "undefined")
            playSound(INTRO_SOUND,0);  
    }
  }
  else if (!game.state) {
    // user controls
    if (bucket.key.left.pressed) {
        bucket.pos.x -= bucket.speed; 
    }
    if (bucket.key.right.pressed) {
        bucket.pos.x += bucket.speed; 
    }

    // enforce movement boundaries to screen 
    if (bucket.pos.x < bucket.width/2) { bucket.pos.x = bucket.width/2;}
    if (bucket.pos.x > screenWidth-bucket.width/2) { bucket.pos.x = screenWidth-bucket.width/2;}

    // bomber movement and npc controls
    if (Math.abs(bomber.pos.x-bomber.target.x) < bomber.speed)
        bomber.target.x = Math.random()*screenWidth;    

    if (bomber.pos.x < bomber.target.x)
        bomber.pos.x += bomber.speed; 
    else
        bomber.pos.x -= bomber.speed; 

    // decide if bomb should be dropped
    var temp_sam = Math.random();
    if ((temp_sam < bomber.droprate)) {  //&& (INTRO_SOUND.paused)) {
       for (i=0;((i<BOMBS_MAX)&&(bombs[i].active));i++) {}
       if ((i<BOMBS_MAX) & (game.dropped.stage < game.dropped.limit)) {
           bombs[i].active = true; 
           //alert("bomb dropped " + bomber.droprate + " " + temp_sam);
           bombs[i].pos.x = bomber.pos.x;
           game.dropped.stage++;
           game.dropped.game++;
       }
    }

    var caught = false;
    var num_active = 0;

    // testing bomb triggers
    for (i=0;i<BOMBS_MAX;i++) {
        if (bombs[i].active) {
            bombs[i].pos.y += bombs[i].speed;
            num_active++;
        }
        if (bombs[i].pos.y > screenHeight) {
            bombs[i].pos.x = bomber.pos.x
            //bombs[i].pos.y = 200;
            bombs[i].pos.y = 200 + Math.random() * 200;
            //bombs[i].active = false;
            game.state = 1;
            game.dropped.stage = 0;
        }
        caught = false;
        if ((bombs[i].pos.x-bombs[i].width/2 < bucket.pos.x+bucket.width/2) && (bombs[i].pos.x+bombs[i].width/2 > bucket.pos.x-bucket.width/2) && (bombs[i].pos.y-bombs[i].height/2 < bucket.pos.y+bucket.height/2) && (bombs[i].pos.y+bombs[i].height/2 > bucket.pos.y-bucket.height/2)) 
            caught = true;
        if ((bombs[i].pos.x-bombs[i].width/2 < bucket.pos.x+bucket.width/2) && (bombs[i].pos.x+bombs[i].width/2 > bucket.pos.x-bucket.width/2) && (bombs[i].pos.y-bombs[i].height/2 < (bucket.pos.y+90)+bucket.height/2) && (bombs[i].pos.y+bombs[i].height/2 > (bucket.pos.y+90)-bucket.height/2)) 
            caught = true;
        if ((bombs[i].pos.x-bombs[i].width/2 < bucket.pos.x+bucket.width/2) && (bombs[i].pos.x+bombs[i].width/2 > bucket.pos.x-bucket.width/2) && (bombs[i].pos.y-bombs[i].height/2 < (bucket.pos.y+180)+bucket.height/2) && (bombs[i].pos.y+bombs[i].height/2 > (bucket.pos.y+180)-bucket.height/2)) 
            caught = true;

        if (caught) {
            bombs[i].pos.x = bomber.pos.x
            bombs[i].pos.y = 200 + Math.random() * 200;
            score += game.stage + 1;
            bombs[i].active = false;
            if (CATCH_SOUND.paused)
                playSound(CATCH_SOUND,0);  
            else
                CATCH_SOUND.currentTime = 0;
        }
        if (Math.round(Math.random())) 
            bombs[i].color = makeColor(0,0,0);
        else
            bombs[i].color = makeColor(1,0,0);
    }
    
    // test if stage is complete
    if ((num_active == 0) && (game.dropped.stage >= game.dropped.limit) && (bomber.speed > 0)) {
        bomber.speed = 0;
        setTimeout(function(){
            game.dropped.limit = game.stages[Math.min(game.stage,7)].limit;
            game.dropped.stage = 0;
            bomber.speed = game.stages[Math.min(game.stage,7)].speed;
            bomber.droprate = game.stages[Math.min(game.stage,7)].droprate;
            game.stage++;
        },3000);
    }
    
    // issue: test for extra life (not done)
  }
  else if (game.state == 1)
  {
      max_y = 0;
      max_i = -1;
      for (i=0;((i<BOMBS_MAX));i++) {
          if ((bombs[i].active)&&(bombs[i].pos.y > max_y)) {
              max_i = i;
              max_y = bombs[i].pos.y;
          }
      }
      if (max_i < 0) game.state = 2;
      else if ((cur_bomb == max_i)&&(currentTime()-mark_time>0.3)) {
          bombs[max_i].active = false;
          playSound(EXPLODE_SOUND,0);
      }
      else if (currentTime()-mark_time<=0.3) {}
      else {
          bombs[max_i].active = 2;
          cur_bomb = max_i;
          mark_time = currentTime();
      }
  }
  else if (game.state == 2)
  {
      mark_time = currentTime();
      game.lives--; 
      if (game.lives == 0) {
          game.state = 3;
          setTimeout(function(){game.state = 4;},1000);
      }
      else { 
          game.state = 3;
          setTimeout(function(){game.state = 0;},3000);
      }
      // game.state = 0;
      for (i=0;((i<BOMBS_MAX));i++) {
          bombs[i].pos.x = bomber.pos.x
          bombs[i].pos.y = bomber.pos.y;
          bombs[i].active = false;
      }
  }
  else if (game.state == 4) {
    if ((bucket.key.left.pressed)||(bucket.key.right.pressed)) 
      onSetup();
  }

}

function display() {

    // Some sample drawing 
    clearScreen();

    //draw playarea
    fillRectangle(0, 0, screenWidth, screenHeight, makeColor(0.5,0.5,0.5));
    for (i=0;((i<BOMBS_MAX)&&(bombs[i].active!=2));i++);
    if  (i < BOMBS_MAX)
       fillRectangle(0, 0, screenWidth, screenHeight, makeColor(Math.random(),Math.random(),Math.random()));
    fillRectangle(0, bomber.pos.y+0.45*bomber.height, screenWidth, screenHeight, makeColor(0,0.5,0));


    //draw bucket
    //fillRectangle(bucket.pos.x-bucket.width/2, bucket.pos.y-bucket.height/2, bucket.width, bucket.height, bucket.color);
    if (game.lives > 0)
        drawImage(bucket.sprite,bucket.pos.x-bucket.width/2, bucket.pos.y-bucket.height/2);
    if (game.lives > 1)
        drawImage(bucket.sprite,bucket.pos.x-bucket.width/2, (bucket.pos.y+90)-bucket.height/2);
    if (game.lives > 2)
        drawImage(bucket.sprite,bucket.pos.x-bucket.width/2, (bucket.pos.y+180)-bucket.height/2);

    //draw bomber
    //fillRectangle(bomber.pos.x-bomber.width/2, bomber.pos.y-bomber.height/2, bomber.width, bomber.height, bomber.color);
    drawImage(bomber.sprite,bomber.pos.x-bomber.width/2,bomber.pos.y-bomber.height*BOMBER_SPRITE_OFFSET);

    // draw bombs
    for (i=0;i<BOMBS_MAX;i++) {
        if (bombs[i].active) { 
            //fillRectangle(bombs[i].pos.x-bombs[i].width/2, bombs[i].pos.y-bombs[i].height/2, bombs[i].width, bombs[i].height, bombs[i].color);
            //fillText(i, bombs[i].pos.x, bombs[i].pos.y, makeColor(0.7, 0.7, 0.7, 1.0), "50px Arial", "center", "middle");
            if (bombs[i].active < 2)
               drawImage(BOMB_SPRITE,bombs[i].pos.x-bombs[i].width/2, bombs[i].pos.y-bombs[i].height/2);
            else {
               drawImage(EXPLODE_SPRITE,bombs[i].pos.x-bombs[i].width/2, bombs[i].pos.y-bombs[i].height/2);
            }
        }
    }

    //draw score
    fillText(score, screenWidth/2, 50, makeColor(0.7, 0.7, 0.2, 1.0), "100px Arial", "center", "middle");

    //draw label
    fillRectangle(0, screenHeight-50, screenWidth, screenHeight, makeColor(0,0,0));
    drawImage(BOTTOM_LABEL,(screenWidth-141)/2,screenHeight-45);

    //draw title
    if (game.state < 0) {
        if (typeof TITLE_BOTTOM === "undefined") {
            drawImage(TITLE,screenWidth/2-TITLE.width/2,screenHeight/2-TITLE.height/2);
        }
        else
        {
            fillRectangle(-20+screenWidth/2-TITLE.width/2,-20+100+screenHeight/2-TITLE.height, 40+TITLE_BOTTOM.width,40+TITLE.height+TITLE_BOTTOM.height, makeColor(1,1,1));
            drawImage(TITLE_BOTTOM,screenWidth/2-TITLE_BOTTOM.width/2,100+screenHeight/2);
        }
    }
    if ((game.state < 0) || (game.state>=4)) {
        if (typeof TITLE_BOTTOM === "undefined")
            drawImage(TITLE,screenWidth/2-TITLE.width/2,screenHeight/2-TITLE.height/2);
        else
            drawImage(TITLE,screenWidth/2-TITLE.width/2,100+screenHeight/2-TITLE.height);
    }
}

///////////////////////////////////////////////////////////////
//                                                           //
//                      HELPER RULES                         //

