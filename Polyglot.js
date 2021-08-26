/*:
* @author browearekissing
* @plugindesc Easy multilingual support for dubs.
* @help 
        -How to use it?-
    First, add the different dubs you'll be using in the parameter tab. Usually, it shouldn't be more than two letters, though you can go for more. As an example, if you have an English and a Japanese dub, you should add "EN" and then "JP".
    It should be displayed like this:

        Dubs            ["EN", "JP"]

    When it is done, add your voicelines in the "audio/se" folder inside your project.
    The naming is really, REALLY important. As an example, if you are using an English and a Japanese dub, you'll have two files for the same voiceline. They should be named like this:

        char01_hello_EN -> This will be played when the player use the English dub
        char01_hello_JP -> This will be played then the player use the Japanese dub

        -Plugin Commands-
    Polyglot play <voiceline name> ~ plays the voiceline.
    Polyglot init ~ Opens a choice window with every language that was set in the plugin parameters.

        -Important notes-
    If you want to play the soundfile "char01_hello_EN", you should use "Polyglot play char01_hello" and NOT "Polyglot play char01_hello_"
 
*
* @param Dubs
* @type text[]
*
*/

/*
* Version 1.0 26/08/2021 ~ Polyglot now works.
* Version 1.1 26/08/2021 ~ It is now possible to change the dub from the pause menu. Language menu added.
*
*/

// == Init ==
var $Polyglot = null;

function Polyglot() {
    var value = PluginManager.parameters('Polyglot')['Dubs'];
    var fontSize = PluginManager.parameters('Polyglot')['Font size'];
    var parsedValue = JSON.parse(value);

    this.currDub = "";
    this.dubs = parsedValue;
    this.menuFontSize = 68;
};

function Scene_Blueprint() {
    this.initialize.apply(this, arguments);
};

function Window_Blueprint() {
    this.initialize.apply(this, arguments);
};


// == Scene ==

Scene_Blueprint.prototype = Object.create(Scene_MenuBase.prototype); //Inherit from whatever type of scene you need here.
Scene_Blueprint.prototype.constructor = Scene_Blueprint;

Scene_Blueprint.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Blueprint.prototype.getRealScreenWidth = function() {
    return window.screen.width * window.devicePixelRatio;
}

Scene_Blueprint.prototype.getRealScreenHeight = function() {
    return window.screen.height * window.devicePixelRatio;
}

Scene_Blueprint.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    var windowWidth = 320;
    var windowHeight = 240;
    this._customWindow = new Window_Blueprint((Graphics.boxWidth / 2) - (windowWidth / 2), (Graphics.boxHeight / 2) - (windowHeight / 2), windowWidth, windowHeight);
    this._customWindow.setHandler("ok", this.reactToOk.bind(this));
    this._customWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._customWindow);
};

Scene_Blueprint.prototype.reactToOk = function() {
    $Polyglot.currDub = $Polyglot.dubs[this._customWindow.index()];
    SceneManager.pop();
};

Scene_Blueprint.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);

    this._customWindow.refresh();
};

// == Scene_Menu ==

var createCommandWindowAlias = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    createCommandWindowAlias.call(this);

    this._commandWindow.setHandler('polyglot', this.commandPolyglot.bind(this));
}

Scene_Menu.prototype.commandPolyglot = function() {
    SceneManager.push(Scene_Blueprint);
}


// == Window ==

Window_Blueprint.prototype = Object.create(Window_Selectable.prototype);
Window_Blueprint.prototype.constructor = Window_Blueprint;

Window_Blueprint.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);

    this.refresh();
    this.activate();
    this.select(0);
}

Window_Blueprint.prototype.maxItems = function() {
    return $Polyglot.dubs.length;
};

Window_Blueprint.prototype.drawItem = function(index) {
    this.drawDubText(index);
}

Window_Blueprint.prototype.drawDubText = function(index) {
    var rect = this.itemRect(index);

    this.changePaintOpacity(false);
    this.drawTextEx($Polyglot.dubs[index], rect.x + this.padding, rect.y);
    this.changePaintOpacity(true);
}

Window_Blueprint.prototype.itemHeight = function() {
    return Math.floor($Polyglot.menuFontSize / this.numVisibleRows());
}

Window_Blueprint.prototype.numVisibleRows = function() {
    return this.maxItems();
}

// == Window_MenuCommand

var addOriginalCommandsAlias = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
    addOriginalCommandsAlias.call(this);
    this.addCommand("Languages", "polyglot", true);
}

// == Save & Load
var createGameObjectAlias = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    createGameObjectAlias.call(this);

    $Polyglot = new Polyglot();
};

var makeSaveContentsAlias = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var contents = makeSaveContentsAlias.call(this);

    contents.Polyglot = $Polyglot;
    return contents;
};

var extractSaveContentsAlias = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    extractSaveContentsAlias.call(this, contents);

    if (contents.Polyglot) {
        $Polyglot = contents.Polyglot;
    }
};

// == Functions ==

function playVoiceline(voicelineName) {
    var lang = $Polyglot.currDub;

    AudioManager.playSe({name: voicelineName + "_" + lang, volume: 100, pitch:100, pan:0});
};

function initDub() {
    var value = PluginManager.parameters('Polyglot')['Dubs'];
    var parsedValue = JSON.parse(value);


    $gameMessage.add("Choose the language you want to use.");
    $gameMessage.setChoices(parsedValue,0, 0);
    $gameMessage.setChoiceCallback(
        function(choice) {
            $Polyglot.currDub = parsedValue[choice];
        }
    )
}

// == Plugin Commands ==
(function() {
    var pluginCommandsAlias = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        pluginCommandsAlias.call(this, command, args);

        if (command == "Polyglot") {
            switch (args[0]) {
                case "play":
                    playVoiceline(args[1]);
                    break;
                case "init":
                    initDub();
                    break;
            }

        }
        return true;
    };
})();