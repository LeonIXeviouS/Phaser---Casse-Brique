var app = new Phaser.Game(800, 540, Phaser.AUTO, 'phaser-game', { create: create});

function create() {
 var style = { font : "65px Arial",
 fill: "#3399FF",
 align: "center"
 };
 var text = app.add.text(app.world.centerX, app.world.centerY, "1stPhaserGame", style);
 text.anchor.set(0.5);
}