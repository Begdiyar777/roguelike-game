function Game(){
    // Признак стена или пол
    this.wall = 0;
    this.tile = 1;
    this.map = [];
    this.mapWidth = 40;
    this.mapHeight = 24;
    this.fieldElement = document.querySelector('.field');
    this.hero = { x: 0, y: 0, health: 100, damage: 10 };
    this.enemies = [];
    this.sword = [];
    this.healthPotions = [];
    this.addEventListeners(); 
}

Game.prototype.init = function(){
    this.generateMap();
    this.drawRooms();
    this.placeEntityRandomly('sword', 2); // Размещаем мечи
    this.placeEntityRandomly('healthPotion', 10); // Размещаем зелья здоровья
    this.placeEntityRandomly('hero'); // Размещаем героя
    this.placeEntityRandomly('enemy', 10); // Размещаем противников
    this.drawMap();
}


// Пункт 1-2 Генерим карту и заполняем стеной
Game.prototype.generateMap = function(){
    for (var i = 0; i < this.mapHeight; i++) {
        this.map[i] = new Array(this.mapWidth).fill(this.wall);
    }
}


// Пункт 3-4 Размещаем комнаты и коридоры
Game.prototype.drawRooms = function(){

     // Опрделяем количество комнат
     var rooms = this.getRandomInt(5, 10);

     // Задаем начальные координаты
     var x = 0;
     var y = 3;

     // направление кооридора h - horizontal, v - vertical
     var dir = 'h';
     

     // пока есть комнаты для вставок
     while (rooms) {
         // определяем размеры комнаты
         var roomH = this.getRandomInt(3, 8);
         var roomW = this.getRandomInt(3, 8);
         

         // определяем центр комнаты чтоб провести с этой точки коридор
         var HalfHeight = this.getRoomCenter(roomH);
         var HalfWidth = this.getRoomCenter(roomW);
         
         // вставим комнату с точки x и y
         for (var i = y; i < y + roomH; i++) {
            this.map[i].splice.apply(this.map[i], [x, roomW].concat(Array(roomW).fill(this.tile)));
        }
         

         // Если коридор горизонтальный
         if (dir === 'h') {
             // прорезаем коридор с центра комнаты
             this.map[y + HalfHeight].splice.apply(this.map[y + HalfHeight], [0, this.mapWidth].concat(Array(this.mapWidth).fill(this.tile)));
             // следующий коридор делаем вертикальный
             dir = 'v';
         } else {
             // Иначе делаем коридор вертикальным с центра ширины комнаты
             for (var j = 0; j < this.mapHeight; j++) {
                 this.map[j].splice(x + HalfWidth, 1, this.tile);
             }
             dir = 'h'; // переопределяем направление следующего коридора
         }
         
         // Если следющая комнаты выходит за рамки карты
         if (x + 8 > this.mapWidth - 1) {
             // строим комнату на первый нижний ряд
             x = 4;
             y = y + 12;
         } else {
             // иначе движемся в право 
             x = x + 8;
         }

         // уменьшаем кол-во комнат
         rooms--;
     }
}


// Пункт 5-6-7. Метод для размещения сущностей игры на свободные позиции рандомно 
Game.prototype.placeEntityRandomly = function(entityType, count = 1){
    for (var i = 0; i < count; i++) {
        var x, y;
        do {
            x = this.getRandomInt(0, this.mapWidth - 1);
            y = this.getRandomInt(0, this.mapHeight - 1);
        } while (this.map[y][x] !== this.tile);
        
        this.map[y][x] = entityType;
        
        if (entityType === 'hero') {
            this.hero.x = x;
            this.hero.y = y;
        } else if (entityType === 'enemy') {
            this.enemies.push({ x, y, health: 50, damage: 5 });
        }
    }
}

// Пункт 8-9 Атака на клавишу пробел и передвижение с помощью WASD
Game.prototype.addEventListeners = function(){
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w':
                this.moveHero(0, -1);
                break;
            case 'a': 
                this.moveHero(-1, 0);
                break;
            case 's':
                this.moveHero(0, 1);
                break;
            case 'd':
                this.moveHero(1, 0);
                break;
            case ' ':
                this.attackEnemies();
                break;
        }
        this.moveEnemiesTowardsHero();
        this.checkForEnemies();
        this.drawMap()
    });
}

// Пункт 10 атака героя противниками если они в соседних клетках
Game.prototype.checkForEnemies = function(){
    for (var enemy of this.enemies) {
        if (Math.abs(this.hero.x - enemy.x) <= 1 && Math.abs(this.hero.y - enemy.y) <= 1) {
            this.hero.health -= enemy.damage;
        }
    }
    // Если не осталось врагов или закончилась жизнь
    if (this.hero.health <= 0 || this.enemies.length === 0) {
        this.gameOver(); // Игра закончена
    }
}

// Пункт 11 Поиск героя врагами 
Game.prototype.moveEnemiesTowardsHero = function(){
    for (var enemy of this.enemies) {
        // Вычисляем направление движения к герою
        var dx = Math.sign(this.hero.x - enemy.x);
        var dy = Math.sign(this.hero.y - enemy.y);

        // Проверяем валидность новой позиции
        var newX = enemy.x + dx;
        var newY = enemy.y + dy;
        // Если кратчайщий путь валиден движемся по нему
        if (this.isValidMove(newX, newY)){
            this.map[enemy.y][enemy.x] = this.tile
            enemy.x = newX;
            enemy.y = newY;
            this.map[newY][newX] = 'enemy'

            // Иначе пытаемся сократить расстояние по х либо по у
        } else if(this.isValidMove(newX, enemy.y)){ 
            this.map[enemy.y][enemy.x] = this.tile
            enemy.x = newX
            this.map[enemy.y][newX] = 'enemy'
        } else if(this.isValidMove(enemy.x, newY)){ 
            this.map[enemy.y][enemy.x] = this.tile
            enemy.y = newY
            this.map[newY][enemy.x] = 'enemy'
        }
    }
}

// Пункт 12-13 получение буста от зелья ли меча при наступлении на них
Game.prototype.checkForItems = function(){
    if (this.map[this.hero.y][this.hero.x] === 'sword') {
        this.hero.damage += 5; // если мечь добавляем +5 к урону
        console.log('after sw damage = ', this.hero.damage)
        this.sword = this.sword.filter(item => !(item.x === this.hero.x && item.y === this.hero.y));
    } else if (this.map[this.hero.y][this.hero.x] === 'healthPotion') {
        this.hero.health = 100; // если зелья пополняем жизнь до 100
        console.log('after hp health = ', this.hero.health)
        this.healthPotions = this.healthPotions.filter(item => !(item.x === this.hero.x && item.y === this.hero.y));
    }
}


/* ===== Вспомогательные методы ===== */

// Рандомное число в диапозоне min, max 
Game.prototype.getRandomInt = function(min, max){
    return Math.floor(min + Math.random() * (max - min));
}

// Центр длины комнаты (точка для проведения коридора)
Game.prototype.getRoomCenter = function(roomLength){
    return Math.round(roomLength / 2) - 1;
}

// Метод для атак врагов вокруг
Game.prototype.attackEnemies = function(){
    for (var enemy of this.enemies) {
        //если враг на соседней клетке
        if (Math.abs(this.hero.x - enemy.x) <= 1 && Math.abs(this.hero.y - enemy.y) <= 1) {
            enemy.health -= this.hero.damage; // отнимаем урон от жизни врага
            //если враг умер
            if (enemy.health <= 0) {
                this.map[enemy.y][enemy.x] = this.tile // убираем его с карты
                // убираем его с массива врагов
                this.enemies = this.enemies.filter(item => !(item.x === enemy.x && item.y === enemy.y));
            }
        }
    }
}

// Метод для передвижения героя
Game.prototype.moveHero = function(dx, dy){
    var newX = this.hero.x + dx;
    var newY = this.hero.y + dy;

    if (this.isValidMove(newX, newY)) {
        this.map[this.hero.y][this.hero.x] = this.tile; // Очищаем старую позицию
        this.hero.x = newX;
        this.hero.y = newY;

        this.checkForItems();
        this.map[newY][newX] = 'hero'; // Обновляем позицию героя на карте

    }
}

// Метод для проверки валидности хода
Game.prototype.isValidMove = function(x, y){
    // Проверяем, что координаты (x, y) находятся в пределах карты
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
        return false;
    } else if (this.map[y][x] === this.wall || this.map[y][x] === 'enemy' || this.map[y][x] === 'hero') {
        return false;
    } else {
        return true;
    }
}

// Метод для разметки карты в HTML документе
Game.prototype.drawMap = function(){
    this.fieldElement.innerHTML = '';
    
    for (var y = 0; y < this.mapHeight; y++) {
        for (var x = 0; x < this.mapWidth; x++) {
            var field = document.createElement('div');

            // Добавляем стили в зависимости от типа ячейки
            if (this.map[y][x] === this.wall) {
                field.className = 'tileW';
            } else if (this.map[y][x] === this.tile) {
                field.className = 'tile';
            } else if (this.map[y][x] === 'hero') {
                field.className = 'tileP';
                field.appendChild(this.createHealthBar(this.hero.health)); // Добавляем полосу здоровья для героя
            } else if (this.map[y][x] === 'enemy') {
                field.className = 'tileE';
                var enemy = this.getEnemyAtPosition(x, y);
                field.appendChild(this.createHealthBar(enemy.health)); // Добавляем полосу здоровья для врага
            } else if (this.map[y][x] === 'sword') {
                field.className = 'tileSW';
            } else if (this.map[y][x] === 'healthPotion') {
                field.className = 'tileHP';
            }

            // Добавляем ячейку в поле
            this.fieldElement.appendChild(field);
        }
    }
}


/* === Что то от себя === */

// Метод для создания полосы здоровья с цветовой индикацией
Game.prototype.createHealthBar = function(health){
    var healthBar = document.createElement('div');
    healthBar.className = 'health';
    healthBar.style.width = health + '%'; // Устанавливаем начальную ширину полосы здоровья

    // Устанавливаем цвет полосы в зависимости от текущего уровня здоровья
    if (health > 20) {
        healthBar.style.backgroundColor = 'green'; // Зеленый цвет, если здоровье больше 20%
    } else {
        healthBar.style.backgroundColor = 'red'; // Красный цвет, если здоровье меньше или равно 20%
    }

    return healthBar;
}


// Метод для получения объекта врага по его координатам
Game.prototype.getEnemyAtPosition = function(x, y){
    for (var enemy of this.enemies) {
        if (enemy.x === x && enemy.y === y) {
            return enemy;
        }
    }
    return null;
}

// Метод для обновления полосы здоровья
Game.prototype.updateHealthBar = function(element, health){
    element.style.width = health + '%';
}



// Перезапуск игры
Game.prototype.resetGame = function(){
    this.hero.health = 100;
    this.hero.damage = 10;
    this.enemies = [];
    this.sword = [];
    this.healthPotions = [];
    this.init(); // Перезапуск игры
}


// Конец игры
Game.prototype.gameOver = function(){
    // Определяем заголовок диалогового окна в зависимости от результата игры
    var gameOverTitle = document.getElementById('game-over-title');
    if(this.hero.health <= 0){
        gameOverTitle.textContent =  'Вы проиграли';
    } else if(this.enemies.length === 0){
        gameOverTitle.textContent =  'Вы выиграли';
    }
    
    // Показываем диалоговое окно
    document.getElementById('game-over-dialog').style.display = 'block';

    // Инициализируем кнопку "Сыграть еще"
    document.getElementById('play-again-button').addEventListener('click', () => {
    // При нажатии на кнопку перезапускаем игру
    this.resetGame();
    // Скрываем диалоговое окно
    document.getElementById('game-over-dialog').style.display = 'none';
    });
}


//  Запуск при открытии index.html
var game = new Game()
game.init()


