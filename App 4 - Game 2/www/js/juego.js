var app={
  inicio: function(){
    DIAMETRO_BOLA = 50;
    MARGEN_DISTANCIA = 30;
    ANCHO_LINEA = 10;
    dificultad = 300;
    velocidadX = 0;
    velocidadY = 0;
    puntuacion = 0;
    status = 0; // 0 = PLAYING; 1 = PAUSED
    
    alto  = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;
    
    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function(){

    function preload() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      game.stage.backgroundColor = '#f27d0c';
      game.load.image('bola', 'assets/bola.png');
      game.load.image('objetivo', 'assets/objetivo.png');
    }

    function create() {
      scoreText = game.add.text(16, 16, puntuacion, { fontSize: '100px', fill: '#757676' });
      
      objetivo = game.add.sprite(ancho - (DIAMETRO_BOLA + MARGEN_DISTANCIA), alto - (DIAMETRO_BOLA + MARGEN_DISTANCIA), 'objetivo');
      bola = game.add.sprite(MARGEN_DISTANCIA, MARGEN_DISTANCIA, 'bola');

      sprite1 = game.add.sprite(app.linePosition(1), 0, null);
      sprite2 = game.add.sprite(app.linePosition(2), app.linePosition(1), null);
      
      game.physics.arcade.enable(bola);
      game.physics.arcade.enable(objetivo);

      game.physics.arcade.enable(sprite1);
      sprite1.body.setSize(ANCHO_LINEA, alto - app.linePosition(1), 0, 0);
      game.physics.arcade.enable(sprite2);
      sprite2.body.setSize(ANCHO_LINEA, alto - app.linePosition(1), 0, 0);

      line1 = new Phaser.Rectangle(app.linePosition(1), 0, ANCHO_LINEA, alto - app.linePosition(1));
      line2 = new Phaser.Rectangle(app.linePosition(2), app.linePosition(1), ANCHO_LINEA, alto - app.linePosition(1));

      bola.body.collideWorldBounds = true;
      bola.body.onWorldBounds = new Phaser.Signal();
      bola.body.onWorldBounds.add(app.decrementaPuntuacion, this);
      game.input.onDown.add(changeState, this);
    }

    function changeState() {
      if (status==0) {
        scoreText.text = 'P: '+puntuacion;
        status = 1;
      } else {
        scoreText.text = puntuacion;
        status = 0;
      }
    }

    function update(){
      if (status==0) {
        bola.body.velocity.y = (velocidadY * dificultad);
        bola.body.velocity.x = (velocidadX * (-1 * dificultad));
        
        game.physics.arcade.overlap(bola, objetivo, app.incrementaPuntuacion, null, this);
        game.physics.arcade.overlap(bola, sprite1, app.decrementaPuntuacion, null, this);
        game.physics.arcade.overlap(bola, sprite2, app.decrementaPuntuacion, null, this);
      } else {
        bola.body.velocity.y = 0;
        bola.body.velocity.x = 0;
      }
    }

    function render() {
      game.debug.geom(line1);
      game.debug.geom(line2);
    }

    var estados = { preload: preload, create: create, update: update, render: render };
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser',estados);
  },

  decrementaPuntuacion: function(){
    puntuacion = puntuacion-1;
    scoreText.text = puntuacion;
    app.restartGame();
  },

  incrementaPuntuacion: function(){
    puntuacion = puntuacion+1;
    scoreText.text = puntuacion;
    app.restartGame();
  },

  restartGame: function(){
    bola.body.x = MARGEN_DISTANCIA;
    bola.body.y = MARGEN_DISTANCIA;
  },

  linePosition: function(linePosition){
    var eachColumn = DIAMETRO_BOLA + (MARGEN_DISTANCIA * 2);
    var separators = (linePosition - 1 * ANCHO_LINEA)
    return (eachColumn * linePosition) + separators;
  },

  vigilaSensores: function(){
    
    function onError() {
        console.log('onError!');
    }

    function onSuccess(datosAceleracion){
      if (status==0) {
        app.detectaAgitacion(datosAceleracion);
        app.registraDireccion(datosAceleracion);
      }
    }

    navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 10 });
  },

  detectaAgitacion: function(datosAceleracion){
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;

    if (agitacionX || agitacionY){
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function(){
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion){
    velocidadX = datosAceleracion.x ;
    velocidadY = datosAceleracion.y ;
  }

};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        app.inicio();
    }, false);
}