/*:
* @author browearekissing
* @plugindesc Blueprint file. Has all the default stuff for a custom window and some explanations.
* @help -Plugin Commands-
    This plugin does not have plugin commands.
*
*/

// == Init ==
var $CustomWindow = null;


//This is the data that will be saved to a file when the user save their game.
function Blueprint_CustomWindow() {
    this.data = null;
};

function Scene_Blueprint() {
    this.initialize.apply(this, arguments);
};

function Window_Blueprint() {
    this.initialize.apply(this, arguments);
};


// == Scene ==

/*
    Default stuff for scenes.
    Call "SceneManager.push(Scene_Blueprint)" when you need to show your window. 
    
    Notes in the case of a Window_Selectable:
        -create()
            You will need to call setHandler(<command>, this.functionToRun.bind(this)) for the menu to react when the user presses something.
            Look for "Input.keyMapper" in rpg_core.js for a list of commands.

        -start()
        You will need to call refresh() here.
*/
Scene_Blueprint.prototype = Object.create(Scene_MenuBase.prototype); //Inherit from whatever type of scene you need here.
Scene_Blueprint.prototype.constructor = Scene_Blueprint;

Scene_Blueprint.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Blueprint.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._customWindow = new Window_Blueprint(0, 0, 320, 240);
    this.addWindow(this._customWindow);
};

Scene_Blueprint.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
};

Scene_Blueprint.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    if(Input.isTriggered("escape")) {
        SceneManager.pop();
    }
};
// == Window ==

/*
There are some functions that need to be implemented for a window to work. Here is a list of what you need. 
Functions with a star at the end will need to also call the inherited object method. 

    Window_Base:
        -initialize* (Call drawAllItems() in it)
        -drawAllItems

    Window_Selectable:
        -initialize* (Call this.refresh(), this.activate() and this.select(index) in it)
        -maxItems
        -drawItem
        -itemHeight

    Notes on Window_Selectable: 
        drawAllItems() is called from refresh().
        maxItems() is the maximum amount of items that will appear in your window. If you need to display 2 swords then it should be 2. 

*/

Window_Blueprint.prototype = Object.create(Window_Base.prototype); //Inherit whatever type of window you need here.
Window_Blueprint.prototype.constructor = Window_Blueprint;

Window_Blueprint.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
};



// == Functions == 

/*
    Any custom function should go here.
*/

// == Save & Load ==

var createGameObjectAlias = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    createGameObjectAlias.call(this);

    $CustomWindow = new Blueprint_CustomWindow();
};

var makeSaveContentsAlias = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var contents = makeSaveContentsAlias.call(this);

    contents.CustomWindow = $CustomWindow;
    return contents;
};

var extractSaveContentsAlias = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    extractSaveContentsAlias.call(this, contents);

    if (contents.CustomWindow) {
        $CustomWindow = contents.CustomWindow;
    }
};

// == Plugin Commands ==
(function() {

    var pluginCommandsAlias = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        pluginCommandsAlias.call(this, command, args);

        if (command == "The name of your plugin") {
            switch (args[0]) { // Args[0] is the first word that comes after the name of your plugin when using a plugin command.
               case "firstCommand":
                   console.log("first command");
                   break;
            }

        }
        return true;
    };
})();