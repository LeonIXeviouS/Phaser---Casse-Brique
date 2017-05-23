var game = new Phaser.Game(800, 600, Phaser.CANVAS);
var vitesse = 350; // Vitesse du paddle
var life = 3; // Nombre de vie
var score = 0; // Score du joueur
var timer_bonus;
var timer_speed;
var vitesse_ball = 12;
var music_principal;
var music_win;
var music_lose;
var button;
var timer_missile;
var timerMissile;
var game_lancer = true;


var casse_brique = {

	preload: function(){
		// Chargement image
		// Background
		game.load.image('fond','assets/background.jpg'); // Chargement du background
		// Paddle
		game.load.image('paddle','assets/paddle.jpg'); // Chargement de l'image du paddle
		// Briques
		game.load.image('brique','assets/brique.png');// Chargement de l'image d'une brique
		// Ball
    	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    	game.scale.pageAlignHorizontally = true; // Avoir le ball.x
    	game.scale.pageAlignVertically = true; // Avoir le ball.y
		game.load.image('ball','assets/ball.png');// Chargement de l'image de la ball
		// image lose
		game.load.image('nelson','assets/nelson.png'); // Chargement image lose
		// image missile
		game.load.image('missile_d','assets/missile_d.png'); // Chargement image missile droit
		game.load.image('missile_g','assets/missile_g.png'); // Chargement image missile gauche
		// Button start
		//game.load.spritesheet('button', 'assets/button.jpg', 193, 71);

		game.load.image('speed','assets/speed.png'); // Chargement image boost speed
		// audio
			// musique de fond
		game.load.audio('principal', ['audio/8bit-space.mp3', 'assets/audio/8bit-space.ogg']);
			// musique win
		game.load.audio('win', ['audio/win.mp3', 'assets/audio/win.ogg']);
			// musique lose
		game.load.audio('lose', ['audio/nelson.mp3', 'assets/audio/nelson.ogg']);
	},
	
	create: function(){

		

		// jeu + affichage
		game.physics.startSystem(game.physics.ARCADE); // Chargement de la physique

		// Background
		game.add.sprite(0, 0, 'fond'); //Initialisation du background

		// Paddle
		this.paddle = game.add.sprite(400, 550, 'paddle'); //Initialisation de l'image du paddle
		this.paddle.anchor.set(0.5); // déplacement de l'image paddle d'un demi pixel
		game.physics.arcade.enable(this.paddle);// Ajout de la physique(collition) sur le paddle
		this.cursors = game.input.keyboard.createCursorKeys(); // Permettre au paddle de reagir aux touches
		this.paddle.body.immovable = true; // Aucune objet interne du jeu ne peut déplacer cette item
		this.paddle.body.collideWorldBounds = true; // Collition du paddle avec les murs du CANVAS
		this.paddle.body.bounce.set(1); // effect de rebont

		// Ball
		this.ball = game.add.sprite(400, 530, 'ball'); //Initialisation(collition) de l'image de ball
		this.ball.anchor.set(0.5); // déplacement de l'image ball d'un demi pixel
		game.physics.arcade.enable(this.ball); // Ajout de la physique sur la ball
		game.physics.arcade.checkCollision.down = false; // Aucune collition avec le mur du bas
		this.ball.body.collideWorldBounds = true; // La ball rebondit sur les murs
		this.ball.body.velocity.x = 200; // Velocité ( vitesse ) de la ball en x au démarrage
		this.ball.body.velocity.y = 200; // Velocité ( vitesse ) de la ball en y au démarrage
		this.ball.body.bounce.x = 1; // Gestion des rebonts
		this.ball.body.bounce.y = 1; // Gestion des rebonts

		// Briques
		this.briques = game.add.group(); // Création du groupe briques
		this.briques.enableBody = true; // Le groupe brique est ' reel ' dans notre jeu
		for (var i = 0; i < 12; i++) // colone 12
			for (var j = 0; j < 5; j++) // ligne 5
				game.add.sprite(55+i*60, 55+j*35, 'brique', 0, this.briques); // mise en place des briques
		this.briques.setAll('body.immovable', true); // Aucune brique ne peut etre déplacé par un élément du jeu
		// GUI
		this.life = life; // Quantité de vie 
		this.labelLife = game.add.text(700, 10, "Vies : "+this.life, {font: "30px Arial", fill: "#fff"}); // Affichage vies
		this.score = 0; // Score
		this.labelScore = game.add.text(20, 10, "Score : "+this.score, {font: "30px Arial", fill: "#fff"}); // Affichage score
		

		// Musique de fond
		music_principal = game.add.audio('principal'); // Initialisation de la musique
		music_principal.play(); // Lancement de la musique

		// Missile 
		this.missiles = game.add.group(); // Création du groupe briques
		this.missiles.enableBody = true; // Le groupe brique est ' reel ' dans notre jeu

		// Lancer le timer pour faire spawn les bonus
		this.timerBonus(); // Lancement du timer pour le spauw des bonus

		// Spacebar
		spacebar = this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]); // Initialisation de la barre espace

		

		



	},
	update: function(){
		game.physics.arcade.collide(this.paddle, this.ball, this.ballHitPaddle, null, this); // Quand la ball et le paddle entre en collision, la function ballHitPaddle s'active
		game.physics.arcade.collide(this.ball, this.briques, this.hit, null, this); // Quand la ball et le groupe briques entre en collision, la function hit s'active
		game.physics.arcade.overlap(this.ball, this.briques,this.paddle, null, null, this); // On autorise ball, briques et paddle à rentré en collision
		game.physics.arcade.collide(this.speed, this.paddle, this.speedHitPaddle, null, this); // Quand le bonus 'speed' touche le paddle la fonction speedHitPaddle s'active
		game.physics.arcade.collide(this.missile, this.paddle, this.missileHitPaddle, null, this); // Quand le bonus 'missile' touche le paddle la fonction missileHitPaddle s'active
		game.physics.arcade.collide(this.missile_d, this.briques, this.hitMissile_d, null, this); // Quand le missile droit touche une brique la fonction hitMissile_d s'active
		game.physics.arcade.collide(this.missile_g, this.briques, this.hitMissile_g, null, this); // Quand le missile gauche touche une brique la fonction hitMissile_g s'active

		this.paddle.body.velocity.x = 0; // le paddle est toujours inactif sauf quand...
		if(this.cursors.left.isDown) { //Appuis sur la fleche de gauche
			this.paddle.body.velocity.x = vitesse * -1; // déplacement du corps du paddle
		}
		if(this.cursors.right.isDown) { //Appuis sur la fleche de gauche
			this.paddle.body.velocity.x = vitesse; // déplacement du corps du paddle
		}
		if(this.ball.inWorld == false) { // Si la ball sors du canvas
			this.life -= 1; // Le joueur perd une vie
			// suppression de la ball qui est tombé
			this.ball.kill();
			// création d'une nouvelle balle
			
			this.ball = game.add.sprite(400, 530, 'ball'); //Initialisation(collition) de l'image de ball
			this.ball.anchor.set(0.5);
			game.physics.arcade.enable(this.ball); // Ajout de la physique sur la ball
			game.physics.arcade.checkCollision.down = false; // Aucune collition avec le mur du bas
			this.ball.body.collideWorldBounds = true; // Collision avec les murs du canvas
			this.ball.body.velocity.x = 200; // Velocité ( vitesse ) de la ball en x au démarrage
			this.ball.body.velocity.y = 200; // Velocité ( vitesse ) de la ball en y au démarrage
			this.ball.body.bounce.x = 1; // Gestion des rebonts
			this.ball.body.bounce.y = 1; // Gestion des rebonts
			// suppression du paddle
			this.paddle.kill();
			// ajout du nouveau paddle
			this.paddle = game.add.sprite(400, 550, 'paddle'); //Initialisation de l'image du paddle
			this.paddle.anchor.set(0.5);
			game.physics.arcade.enable(this.paddle);// Ajout de la physique(collition) sur le paddle
			this.cursors = game.input.keyboard.createCursorKeys(); // Permettre au paddle de reagir aux touches
			this.paddle.body.immovable = true; // Aucune objet interne du jeu ne peut déplacer cette item
			this.paddle.body.collideWorldBounds = true; // Collition du paddle avec les murs du Canvas
			this.labelLife.text = "Vies : "+this.life; // Affichage de la nouvelle quantité de vies
			// Le jeu ce met en pause
			this.pause();
		}
		if(this.briques.countLiving() == 0 && game_lancer === true){ // Quand il n'y a plus aucune brique
			this.winGame(); // la function winGame() s'active
		}
		if(this.life <= 0 && game_lancer === true){ // Quand la quantité de vie est inférieur ou égal à 0
			this.gameOver(); // La function gameOver() s'active
		}
		/*if (this.input.keyboard.isDown(Phaser.Keyboard.T)){ // Si la personne appuis sur T
			this.test(); // Lancement de la fonction test
		}*/
		/*if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR, self)){
			this.pause();
		}*/
		if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) // Quand on appuis sur la touche ' SPACE '
          	this.pause(); // La fonction pause s'active
        if(this.input.keyboard.isDown(Phaser.Keyboard.PLUS))
        	this.upVitesse();
        if(this.input.keyboard.isDown(Phaser.Keyboard.MINUS))
        	this.downVitesse();

        
		

		
	},
	restartGame: function(){
		// Relance si le jeu est en pause
		if(game.physics.arcade.isPaused = true) 
			game.physics.arcade.isPaused = false;
		game.state.start('casse_brique'); // restart du jeu casse_brique
	},
	briqueGroup: function(){
		this.brique = game.add.sprite(100, 200, 'brique'); // Initialisation de l'image de la brique
		game.physics.arcade.enable(brique); // Ajout de la physique sur la brique

		this.briques.add(brique); // Ajout de la brique au groupe briques
	},
	missileGroup: function(){
		this.missile_d = game.add.sprite(100, 200, 'missile_d'); // Spawn du missile droit
		game.physics.arcade.enable(missile_d); // Le missile est un corps physique
		this.missile_g = game.add.sprite(100, 200, 'missile_g'); // Spawn du missile gauche
		game.physics.arcade.enable(missile_g); // Le missile est un corps physique
		this.missiles.add(missile_d); // Ajout du missile droit dans le groupe missile
		this.missiles.add(missile_g); // Ajout du missile gauche adns le groupe missile
	},
	hit: function(ball, brique) {
		
		brique.kill(); // La brique qui vien d'étre touchée est détruite
		this.score += 100; // 100 pts sont ajouter au score du joueur
		this.labelScore.text = "Score : "+this.score; // Affichage du nouveau score
	},
	hitMissile_g: function(missile_g, brique){
		
		this.score += 100; // 100 pts sont ajouter au score du joueur
		this.labelScore.text = "Score : "+this.score; // Affichage du nouveau score
		brique.kill(); // Destruction de la brique touchée
		missile_g.kill(); // Destruction du missile

	},
	hitMissile_d: function(missile_d, brique){

		this.score += 100; // 100 pts sont ajouter au score du joueur
		this.labelScore.text = "Score : "+this.score; // Affichage du nouveau score
		brique.kill(); // Destruction de la brique touchée
		missile_d.kill(); // Destruction du missile
	},
	ballHitPaddle: function(){
		var diff = 0; // création de la variable local diff

    	if (this.ball.x < this.paddle.x) // Si la ball est entre la gauche du paddle et son milieu
    	{
        	diff = this.paddle.x - this.ball.x; // la variable diff prend la difference entre le milieu de la ball et le milieu du paddle
        	this.ball.body.velocity.x = ((vitesse_ball * -1) * diff); // La nouvelle vitesse de la ball dépent donc de la variable diff et donc de la distance entre le milieu du paddle
   	 	}
    	else if (this.ball.x > this.paddle.x) // Si la ball est entre la droite du paddle et son milieu
    	{
        	diff = this.ball.x -this.paddle.x; // la variable diff prend la difference entre le milieu de la ball et le milieu du paddle
        	this.ball.body.velocity.x = (vitesse_ball * diff); // La nouvelle vitesse de la ball dépent donc de la variable diff et donc de la distance entre le milieu du paddle
    	}
	},
	gameOver: function(){
		game_lancer = false;
		// Affichage du Game Over
		game.add.text(game.world.centerX + 50, game.world.centerY + 150, 'Game Over', { font: '40px Arial', fill: '#fff' }); 
		game.add.text(game.world.centerX + 50, game.world.centerY + 200, 'Press ENTER to restart', { font: '25px Arial', fill: '#fff' });
		
		// audio
		music_principal.destroy(); // Arret de la musique principal
		game.cache.removeSound('principal'); // Suppression de la musique principal dans le cache 
		this.nelson = game.add.sprite(game.world.centerX - 240, game.world.centerY - 250, 'nelson'); // Affichage de l'image de lose
		music_lose = game.add.audio('lose'); // Initialisation de la musique
		music_lose.play(); // Lancement de la musique de lose
		// pause
		timer.stop(); // Arret du spawn des bonus
		game.physics.arcade.isPaused = true; // Jeu en pause
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)) // Si le joueur appuis sur la touche ENTER ...
			this.restartGame(); // Le jeu se restart 
	},
	pause: function() {
		
		window.onkeydown = function() { // On sors du jeu pour prendre les touches avec windows
            if (game.input.keyboard.event.keyCode == 32){ // Si on appuis sur la touche ' SPACE ' ...
                game.paused = !game.paused; // TOUT le jeu ce met en pause 
            }
        }
	},
	winGame: function() {

		game_lancer = false;
		// Affichage de la victoire
		game.add.text(game.world.centerX - 115, game.world.centerY - 100, 'You have WIN', { font: '40px Arial', fill: '#fff' });
		game.add.text(game.world.centerX - 110, game.world.centerY - 45, 'Press ENTER to restart', { font: '25px Arial', fill: '#fff' });
		// audio
		music_principal.stop(); // Arret de la musique de fond
		game.cache.removeSound('principal'); // Suppression de la musique principal dans le cache 
		music_win = game.add.audio('win'); // Initialisation de la musique
    	music_win.play(); // Lancement de la musique
    	// pause
    	timer.stop(); // Arret du spawn des bonus
		game.physics.arcade.isPaused = true; // Jeu en pause
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)) // Si le joueur appuis sur la touche ENTER ...
			this.restartGame(); // Le jeu se restart
	},
	timerBonus: function(){
		timer = game.time.create(false); // On crée un timer
		timer.loop(10000, this.bonus, this); // Tout les 10 secondes il va lancer la fonction bonus
		timer.start(); // On lance le timer

	},
	bonus: function(){
		var random_bonus = Math.round(Math.random()); // Création d'un chiffre random que l'on arrondis au chiffre le pls proche et mis dans une variable
		if(random_bonus == 0){ // Si le chiffre random crée est égal à 0 alors ...
			// Bonus acceleration de la ball
			this.speed = game.add.sprite(Math.floor((Math.random() * game.world.width) + 1),20,'speed');
			game.physics.arcade.enable(this.speed); // Ajout de la physique sur la ball
			this.speed.body.velocity.y = 200;
		}
		
		else if(random_bonus == 1){ // Si le chiffre random crée est égal à 0 alors ...
			// Bonus acceleration de la ball
			this.missile = game.add.sprite(Math.floor((Math.random() * game.world.width) + 1),20,'missile_d');
			game.physics.arcade.enable(this.missile); 
			this.missile.body.velocity.y = 200;
		}

		
	},
	speedHitPaddle: function(){
		this.speed.kill(); // Destruction du bonus
		vitesse_ball += 12; // Acceleration de la ball
		timer_speed = game.time.create(false); // Création d'un timer 
		timer_speed.loop(15000, this.speedDown, this); // Au bout de 15 secondes la fonction speedDown est activée
		timer_speed.start(); // On demarre de timer
	},
	speedDown: function(){
		vitesse_ball -= 12; // Diminution de la vitesse de la ball
		timer_speed.destroy(); // Arret du timer pour diminuer la vitesse de la ball
	},
	test: function(){ // Touche T
		/*this.game.time.events.pause();*/ // tentative de pause des 3 missiles, l'event est cancel
		/*game.paused = false;*/
		//this.labelVitesse = game.add.text(300, 10, "Vitesse : "+vitesse, {font: "30px Arial", fill: "#fff"}) // Affichage vitesse	
	},
	missileHitPaddle: function(){
		this.game.time.events.repeat(Phaser.Timer.SECOND * 1.5, 3, this.creationMissile, this); // Timer qui va ce répété 3 fois et lance la fonction creationMissile
		this.missile.kill(); // Destruction de l'image du bonus missile
	},

	creationMissile: function(){
		// Créer les missiles a droite et a gauche du paddle
		this.missile_g = game.add.sprite(this.paddle.x - 25, this.paddle.y,'missile_g'); 
		this.missile_d = game.add.sprite(this.paddle.x + 25, this.paddle.y,'missile_d');
		game.physics.arcade.enable(this.missile_g);
		game.physics.arcade.enable(this.missile_d); 
		this.missiles.add(this.missile_d);
		this.missiles.add(this.missile_g);
		this.missile_d.body.velocity.y = - 600;
		this.missile_g.body.velocity.y = - 600;	
	}/*,
	upVitesse: function(){
		vitesse += 20;
		this.labelVitesse.text = "Vitesse : "+vitesse;
	},
	downVitesse: function(){
		vitesse -= 20;
		this.labelVitesse.text = "Vitesse : "+vitesse;
	}*/
	
};

game.state.add('casse_brique',casse_brique);
game.state.start('casse_brique');